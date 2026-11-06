import { DayOffStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../../common/errors/app-error.js";
import { scheduleRepository } from "../repositories/schedule.repository.js";
import type { ShiftInput } from "../schemas/schedule.schema.js";
const parseTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hour, minute));
};
const minutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();
async function ensureNoShiftOverlap(
  staffId: string,
  dayOfWeek: number,
  start: Date,
  end: Date,
  ignoreId?: string,
) {
  if (end <= start)
    throw new AppError(
      422,
      "INVALID_SHIFT",
      "Giờ kết thúc ca phải sau giờ bắt đầu",
    );
  const shifts = await scheduleRepository.listShifts(staffId);
  if (
    shifts.some(
      (shift) =>
        shift.id !== ignoreId &&
        shift.dayOfWeek === dayOfWeek &&
        shift.isActive &&
        minutes(start) < minutes(shift.endTime) &&
        minutes(end) > minutes(shift.startTime),
    )
  )
    throw new AppError(
      409,
      "SHIFT_OVERLAP",
      "Ca làm việc bị trùng với ca đã có",
    );
}
export const scheduleService = {
  async staffForUser(userId: string) {
    const staff = await scheduleRepository.findStaffByUserId(userId);
    if (!staff)
      throw new AppError(
        404,
        "STAFF_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ nhân viên",
      );
    return staff;
  },
  async listOwnShifts(userId: string) {
    const staff = await this.staffForUser(userId);
    return scheduleRepository.listShifts(staff.id);
  },
  async listStaffShifts(staffId: string) {
    if (!(await scheduleRepository.findStaffById(staffId)))
      throw new AppError(404, "STAFF_NOT_FOUND", "Không tìm thấy nhân viên");
    return scheduleRepository.listShifts(staffId);
  },
  async createShift(staffId: string, input: ShiftInput) {
    if (!(await scheduleRepository.findStaffById(staffId)))
      throw new AppError(404, "STAFF_NOT_FOUND", "Không tìm thấy nhân viên");
    const startTime = parseTime(input.startTime),
      endTime = parseTime(input.endTime);
    await ensureNoShiftOverlap(staffId, input.dayOfWeek, startTime, endTime);
    return scheduleRepository.createShift({
      staffId,
      dayOfWeek: input.dayOfWeek,
      startTime,
      endTime,
      isActive: input.isActive,
    });
  },
  async updateShift(
    staffId: string,
    shiftId: string,
    input: Partial<ShiftInput>,
  ) {
    const current = await scheduleRepository.findShift(shiftId);
    if (!current || current.staffId !== staffId)
      throw new AppError(404, "SHIFT_NOT_FOUND", "Không tìm thấy ca làm việc");
    const day = input.dayOfWeek ?? current.dayOfWeek,
      start = input.startTime ? parseTime(input.startTime) : current.startTime,
      end = input.endTime ? parseTime(input.endTime) : current.endTime;
    await ensureNoShiftOverlap(staffId, day, start, end, shiftId);
    return scheduleRepository.updateShift(shiftId, {
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime ? start : undefined,
      endTime: input.endTime ? end : undefined,
      isActive: input.isActive,
    });
  },
  async deleteShift(staffId: string, shiftId: string) {
    const current = await scheduleRepository.findShift(shiftId);
    if (!current || current.staffId !== staffId)
      throw new AppError(404, "SHIFT_NOT_FOUND", "Không tìm thấy ca làm việc");
    await scheduleRepository.deleteShift(shiftId);
  },
  async listOwnDaysOff(userId: string) {
    const staff = await this.staffForUser(userId);
    return scheduleRepository.listDaysOff(staff.id);
  },
  async requestDayOff(
    userId: string,
    input: { startAt: Date; endAt: Date; reason?: string },
  ) {
    const staff = await this.staffForUser(userId);
    if (input.startAt < new Date())
      throw new AppError(
        422,
        "DAY_OFF_IN_PAST",
        "Không thể đăng ký ngày nghỉ trong quá khứ",
      );
    return scheduleRepository.createDayOff({ staffId: staff.id, ...input });
  },
  listAllDaysOff: () => scheduleRepository.listDaysOff(),
  async updateDayOffStatus(id: string, status: "APPROVED" | "REJECTED") {
    const item = await scheduleRepository.findDayOff(id);
    if (!item)
      throw new AppError(
        404,
        "DAY_OFF_NOT_FOUND",
        "Không tìm thấy yêu cầu nghỉ",
      );
    if (item.status !== DayOffStatus.PENDING)
      throw new AppError(
        409,
        "DAY_OFF_ALREADY_REVIEWED",
        "Yêu cầu nghỉ đã được xử lý",
      );
    return scheduleRepository.updateDayOffStatus(id, status);
  },
  async cancelOwnDayOff(userId: string, id: string) {
    const staff = await this.staffForUser(userId);
    const item = await scheduleRepository.findDayOff(id);
    if (!item || item.staffId !== staff.id)
      throw new AppError(
        404,
        "DAY_OFF_NOT_FOUND",
        "Không tìm thấy yêu cầu nghỉ",
      );
    if (item.status !== DayOffStatus.PENDING)
      throw new AppError(
        409,
        "DAY_OFF_ALREADY_REVIEWED",
        "Chỉ có thể hủy yêu cầu đang chờ duyệt",
      );
    await scheduleRepository.deleteDayOff(id);
  },
};
