import type { Prisma } from "../../../generated/prisma/client.js";
import {
  AppointmentStatus,
  DayOffStatus,
  UserStatus,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../../config/prisma.js";
export type AppointmentDb = Prisma.TransactionClient | typeof prisma;
export const appointmentInclude = {
  customer: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  },
  staff: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  },
  services: { include: { service: true } },
  review: true,
} as const;
export const appointmentRepository = {
  getServices: (db: AppointmentDb, ids: string[]) =>
    db.service.findMany({ where: { id: { in: ids }, isActive: true } }),
  eligibleStaff: (db: AppointmentDb, serviceIds: string[], staffId?: string) =>
    db.staffProfile.findMany({
      where: {
        ...(staffId ? { id: staffId } : {}),
        isBookable: true,
        user: { status: UserStatus.ACTIVE },
        AND: serviceIds.map((serviceId) => ({
          services: { some: { serviceId } },
        })),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        shifts: { where: { isActive: true } },
      },
    }),
  staffSnapshot: (db: AppointmentDb, staffId: string) =>
    db.staffProfile.findUnique({
      where: { id: staffId },
      include: {
        user: true,
        shifts: { where: { isActive: true } },
        services: true,
      },
    }),
  conflicts: (
    db: AppointmentDb,
    staffId: string,
    startAt: Date,
    endAt: Date,
    ignoreId?: string,
  ) =>
    db.appointment.findMany({
      where: {
        staffId,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    }),
  daysOff: (db: AppointmentDb, staffId: string, startAt: Date, endAt: Date) =>
    db.staffDayOff.findMany({
      where: {
        staffId,
        status: DayOffStatus.APPROVED,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    }),
  customerByUserId: (userId: string) =>
    prisma.customerProfile.findUnique({ where: { userId } }),
  staffByUserId: (userId: string) =>
    prisma.staffProfile.findUnique({ where: { userId } }),
  customerById: (id: string) =>
    prisma.customerProfile.findUnique({ where: { id } }),
  findById: (id: string) =>
    prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    }),
  list: (where: Prisma.AppointmentWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        include: appointmentInclude,
        orderBy: { startAt: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]),
  update: (id: string, data: Prisma.AppointmentUpdateInput) =>
    prisma.appointment.update({
      where: { id },
      data,
      include: appointmentInclude,
    }),
  dueReminders: (from: Date, to: Date) =>
    prisma.appointment.findMany({
      where: {
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        reminderSentAt: null,
        startAt: { gte: from, lte: to },
      },
      include: appointmentInclude,
    }),
  markReminderSent: (id: string) =>
    prisma.appointment.update({
      where: { id },
      data: { reminderSentAt: new Date() },
    }),
  transaction: <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) =>
    prisma.$transaction(callback, {
      isolationLevel: "Serializable",
      timeout: 10000,
    }),
};
