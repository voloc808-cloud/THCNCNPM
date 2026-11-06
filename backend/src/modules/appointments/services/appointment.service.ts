import { randomBytes } from "node:crypto";
import type { Prisma } from "../../../generated/prisma/client.js";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../common/errors/app-error.js";
import {
  addMinutes,
  localDateString,
  validateBookingDate,
} from "../../../common/utils/date-time.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
import { emailService } from "../../../common/services/email.service.js";
import {
  appointmentInclude,
  appointmentRepository,
} from "../repositories/appointment.repository.js";
import { availabilityService } from "./availability.service.js";
import type {
  AppointmentListInput,
  CreateAppointmentInput,
} from "../schemas/appointment.schema.js";
const activeStatuses: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];
const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  CONFIRMED: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
const code = () =>
  `RB${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;
const mailData = (
  item: Awaited<ReturnType<typeof appointmentRepository.findById>>,
) =>
  item
    ? {
        email: item.customer.user.email,
        fullName: item.customer.user.fullName,
        code: item.code,
        startAt: item.startAt,
        staffName: item.staff.user.fullName,
        services: item.services.map((entry) => entry.serviceName),
        totalPrice: Number(item.totalPrice),
      }
    : null;
async function createLocked(
  customerId: string,
  input: CreateAppointmentInput,
  forcedStaffId?: string,
) {
  if (input.startAt <= new Date())
    throw new AppError(
      422,
      "BOOKING_IN_PAST",
      "Không thể đặt lịch trong quá khứ",
    );
  validateBookingDate(localDateString(input.startAt));
  const summary = await availabilityService.serviceSummary(
    (await import("../../../config/prisma.js")).prisma,
    input.serviceIds,
  );
  const candidates = forcedStaffId
    ? [{ id: forcedStaffId }]
    : await appointmentRepository.eligibleStaff(
        (await import("../../../config/prisma.js")).prisma,
        input.serviceIds,
        input.staffId ?? undefined,
      );
  if (candidates.length === 0)
    throw new AppError(
      409,
      "NO_STAFF_AVAILABLE",
      "Không có thợ phù hợp với các dịch vụ đã chọn",
    );
  for (const candidate of candidates) {
    try {
      return await appointmentRepository.transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM staff_profiles WHERE id = ${candidate.id} FOR UPDATE`;
        const customer = await tx.customerProfile.findUnique({
          where: { id: customerId },
        });
        if (!customer)
          throw new AppError(
            404,
            "CUSTOMER_NOT_FOUND",
            "Không tìm thấy khách hàng",
          );
        const endAt = addMinutes(input.startAt, summary.duration);
        if (
          !(await availabilityService.isStaffAvailable(
            tx,
            candidate.id,
            input.startAt,
            endAt,
            input.serviceIds,
          ))
        )
          throw new AppError(
            409,
            "SLOT_TAKEN",
            "Khung giờ vừa được người khác đặt",
          );
        return tx.appointment.create({
          data: {
            code: code(),
            customerId,
            staffId: candidate.id,
            startAt: input.startAt,
            endAt,
            status: AppointmentStatus.PENDING,
            totalDurationMinutes: summary.duration,
            totalPrice: summary.totalPrice,
            customerNote: input.customerNote,
            services: {
              create: summary.services.map((service) => ({
                serviceId: service.id,
                serviceName: service.name,
                price: service.price,
                durationMinutes: service.durationMinutes,
              })),
            },
          },
          include: appointmentInclude,
        });
      });
    } catch (error) {
      if (error instanceof AppError && error.code === "SLOT_TAKEN") continue;
      throw error;
    }
  }
  throw new AppError(
    409,
    "SLOT_TAKEN",
    "Khung giờ vừa được người khác đặt, vui lòng chọn giờ khác",
  );
}
export const appointmentService = {
  availability: (input: {
    date: string;
    serviceIds: string[];
    staffId?: string;
  }) => availabilityService.slots(input),
  async createForCustomer(userId: string, input: CreateAppointmentInput) {
    const customer = await appointmentRepository.customerByUserId(userId);
    if (!customer)
      throw new AppError(
        404,
        "CUSTOMER_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ khách hàng",
      );
    const item = await createLocked(customer.id, input);
    const email = mailData(item);
    if (email) void emailService.sendBookingConfirmation(email);
    return item;
  },
  async createByAdmin(customerId: string, input: CreateAppointmentInput) {
    if (!(await appointmentRepository.customerById(customerId)))
      throw new AppError(
        404,
        "CUSTOMER_NOT_FOUND",
        "Không tìm thấy khách hàng",
      );
    const item = await createLocked(customerId, input);
    const email = mailData(item);
    if (email) void emailService.sendBookingConfirmation(email);
    return item;
  },
  async list(
    query: AppointmentListInput,
    scope?: { customerId?: string; staffId?: string },
  ) {
    const where: Prisma.AppointmentWhereInput = {
      ...scope,
      ...(query.status ? { status: query.status } : {}),
      ...(query.staffId ? { staffId: query.staffId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search } },
              { customer: { user: { fullName: { contains: query.search } } } },
              { staff: { user: { fullName: { contains: query.search } } } },
            ],
          }
        : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            startAt: {
              ...(query.dateFrom ? { gte: query.dateFrom } : {}),
              ...(query.dateTo ? { lte: query.dateTo } : {}),
            },
          }
        : {}),
    };
    const [items, total] = await appointmentRepository.list(
      where,
      (query.page - 1) * query.limit,
      query.limit,
    );
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async listCustomer(userId: string, query: AppointmentListInput) {
    const customer = await appointmentRepository.customerByUserId(userId);
    if (!customer)
      throw new AppError(
        404,
        "CUSTOMER_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ khách hàng",
      );
    return this.list(query, { customerId: customer.id });
  },
  async listStaff(userId: string, query: AppointmentListInput) {
    const staff = await appointmentRepository.staffByUserId(userId);
    if (!staff)
      throw new AppError(
        404,
        "STAFF_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ nhân viên",
      );
    return this.list(query, { staffId: staff.id });
  },
  async detailForUser(id: string, user: { userId: string; role: Role }) {
    const item = await appointmentRepository.findById(id);
    if (!item)
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Không tìm thấy lịch hẹn",
      );
    const allowed =
      user.role === Role.ADMIN ||
      item.customer.userId === user.userId ||
      item.staff.userId === user.userId;
    if (!allowed)
      throw new AppError(
        403,
        "FORBIDDEN",
        "Bạn không có quyền xem lịch hẹn này",
      );
    return item;
  },
  async cancelByCustomer(id: string, userId: string, reason: string) {
    const item = await this.detailForUser(id, { userId, role: Role.CUSTOMER });
    if (!activeStatuses.includes(item.status))
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        "Chỉ lịch đang chờ hoặc đã xác nhận mới được hủy",
      );
    if (
      item.startAt.getTime() - Date.now() <
      env.MIN_CANCELLATION_HOURS * 3_600_000
    )
      throw new AppError(
        409,
        "CANCELLATION_TOO_LATE",
        `Chỉ được hủy trước giờ hẹn ít nhất ${env.MIN_CANCELLATION_HOURS} giờ`,
      );
    return appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
      cancellationReason: reason,
    });
  },
  async updateStatus(
    id: string,
    status: AppointmentStatus,
    actor: Role,
    reason?: string,
  ) {
    const item = await appointmentRepository.findById(id);
    if (!item)
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Không tìm thấy lịch hẹn",
      );
    if (!transitions[item.status].includes(status))
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Không thể chuyển từ ${item.status} sang ${status}`,
      );
    if (
      actor === Role.STAFF &&
      !(
        [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.NO_SHOW,
        ] as AppointmentStatus[]
      ).includes(status)
    )
      throw new AppError(
        403,
        "FORBIDDEN_STATUS",
        "Nhân viên không được chuyển sang trạng thái này",
      );
    return appointmentRepository.update(id, {
      status,
      ...(status === AppointmentStatus.CANCELLED
        ? { cancellationReason: reason }
        : {}),
    });
  },
  async updateStatusByStaff(
    id: string,
    userId: string,
    status: AppointmentStatus,
  ) {
    const staff = await appointmentRepository.staffByUserId(userId);
    if (!staff)
      throw new AppError(
        404,
        "STAFF_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ nhân viên",
      );
    const item = await appointmentRepository.findById(id);
    if (!item || item.staffId !== staff.id)
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Không tìm thấy lịch hẹn của bạn",
      );
    return this.updateStatus(id, status, Role.STAFF);
  },
  async reschedule(id: string, input: { staffId?: string; startAt: Date }) {
    const current = await appointmentRepository.findById(id);
    if (!current)
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Không tìm thấy lịch hẹn",
      );
    if (!activeStatuses.includes(current.status))
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        "Không thể đổi lịch đã kết thúc",
      );
    if (input.startAt <= new Date())
      throw new AppError(
        422,
        "BOOKING_IN_PAST",
        "Không thể chuyển lịch về quá khứ",
      );
    validateBookingDate(localDateString(input.startAt));
    const staffId = input.staffId ?? current.staffId;
    const endAt = addMinutes(input.startAt, current.totalDurationMinutes);
    return appointmentRepository.transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM staff_profiles WHERE id = ${staffId} FOR UPDATE`;
      const serviceIds = current.services.map((entry) => entry.serviceId);
      if (
        !(await availabilityService.isStaffAvailable(
          tx,
          staffId,
          input.startAt,
          endAt,
          serviceIds,
          id,
        ))
      )
        throw new AppError(
          409,
          "SLOT_TAKEN",
          "Thợ không còn trống trong khung giờ mới",
        );
      return tx.appointment.update({
        where: { id },
        data: { staffId, startAt: input.startAt, endAt },
        include: appointmentInclude,
      });
    });
  },
};
