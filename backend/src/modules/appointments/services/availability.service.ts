import type { Prisma } from "../../../generated/prisma/client.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../common/errors/app-error.js";
import {
  addMinutes,
  combineDateAndTime,
  validateBookingDate,
} from "../../../common/utils/date-time.js";
import {
  appointmentRepository,
  type AppointmentDb,
} from "../repositories/appointment.repository.js";
const weekday = (date: Date) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: env.APP_TIMEZONE,
      weekday: "short",
    })
      .formatToParts(date)
      .find((p) => p.type === "weekday")
      ?.value.replace(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/, (v) =>
        String(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v)),
      ),
  );
const localWeekday = (date: Date) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    new Intl.DateTimeFormat("en-US", {
      timeZone: env.APP_TIMEZONE,
      weekday: "short",
    }).format(date),
  );
export const availabilityService = {
  async serviceSummary(db: AppointmentDb, serviceIds: string[]) {
    const services = await appointmentRepository.getServices(db, serviceIds);
    if (services.length !== serviceIds.length)
      throw new AppError(
        422,
        "INVALID_SERVICES",
        "Một hoặc nhiều dịch vụ không tồn tại hoặc đã ngừng hoạt động",
      );
    return {
      services,
      duration: services.reduce((sum, item) => sum + item.durationMinutes, 0),
      totalPrice: services.reduce((sum, item) => sum + Number(item.price), 0),
    };
  },
  async isStaffAvailable(
    db: AppointmentDb,
    staffId: string,
    startAt: Date,
    endAt: Date,
    serviceIds: string[],
    ignoreId?: string,
  ) {
    const staff = await appointmentRepository.staffSnapshot(db, staffId);
    if (
      !staff ||
      !staff.isBookable ||
      staff.user.status !== "ACTIVE" ||
      !serviceIds.every((id) =>
        staff.services.some((item) => item.serviceId === id),
      )
    )
      return false;
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: env.APP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(startAt);
    const day = localWeekday(startAt);
    const insideShift = staff.shifts.some(
      (shift) =>
        shift.dayOfWeek === day &&
        startAt >= combineDateAndTime(date, shift.startTime) &&
        endAt <= combineDateAndTime(date, shift.endTime),
    );
    if (!insideShift) return false;
    const [conflicts, daysOff] = await Promise.all([
      appointmentRepository.conflicts(db, staffId, startAt, endAt, ignoreId),
      appointmentRepository.daysOff(db, staffId, startAt, endAt),
    ]);
    return conflicts.length === 0 && daysOff.length === 0;
  },
  async slots(input: { date: string; serviceIds: string[]; staffId?: string }) {
    validateBookingDate(input.date);
    const summary = await this.serviceSummary(
      (await import("../../../config/prisma.js")).prisma,
      input.serviceIds,
    );
    const db = (await import("../../../config/prisma.js")).prisma;
    const staff = await appointmentRepository.eligibleStaff(
      db,
      input.serviceIds,
      input.staffId,
    );
    if (input.staffId && staff.length === 0)
      throw new AppError(
        404,
        "STAFF_NOT_AVAILABLE",
        "Thợ không tồn tại hoặc không thực hiện đủ dịch vụ đã chọn",
      );
    const day = localWeekday(new Date(`${input.date}T12:00:00+07:00`));
    const result = new Map<
      string,
      { startAt: string; endAt: string; availableStaffIds: string[] }
    >();
    for (const person of staff) {
      for (const shift of person.shifts.filter(
        (item) => item.dayOfWeek === day,
      )) {
        const shiftStart = combineDateAndTime(input.date, shift.startTime),
          shiftEnd = combineDateAndTime(input.date, shift.endTime);
        for (
          let start = shiftStart;
          addMinutes(start, summary.duration) <= shiftEnd;
          start = addMinutes(start, env.BOOKING_INTERVAL_MINUTES)
        ) {
          const end = addMinutes(start, summary.duration);
          if (start <= new Date()) continue;
          if (
            await this.isStaffAvailable(
              db,
              person.id,
              start,
              end,
              input.serviceIds,
            )
          ) {
            const key = start.toISOString();
            const existing = result.get(key);
            if (existing) existing.availableStaffIds.push(person.id);
            else
              result.set(key, {
                startAt: key,
                endAt: end.toISOString(),
                availableStaffIds: [person.id],
              });
          }
        }
      }
    }
    return {
      date: input.date,
      totalDurationMinutes: summary.duration,
      totalPrice: summary.totalPrice,
      slots: [...result.values()].sort((a, b) =>
        a.startAt.localeCompare(b.startAt),
      ),
    };
  },
};
