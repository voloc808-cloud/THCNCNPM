import { prisma } from "../../../config/prisma.js";
export const scheduleRepository = {
  findStaffByUserId: (userId: string) =>
    prisma.staffProfile.findUnique({ where: { userId } }),
  findStaffById: (id: string) =>
    prisma.staffProfile.findUnique({ where: { id } }),
  listShifts: (staffId: string) =>
    prisma.staffShift.findMany({
      where: { staffId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  findShift: (id: string) => prisma.staffShift.findUnique({ where: { id } }),
  createShift: (data: {
    staffId: string;
    dayOfWeek: number;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
  }) => prisma.staffShift.create({ data }),
  updateShift: (
    id: string,
    data: {
      dayOfWeek?: number;
      startTime?: Date;
      endTime?: Date;
      isActive?: boolean;
    },
  ) => prisma.staffShift.update({ where: { id }, data }),
  deleteShift: (id: string) => prisma.staffShift.delete({ where: { id } }),
  listDaysOff: (staffId?: string) =>
    prisma.staffDayOff.findMany({
      where: staffId ? { staffId } : {},
      include: {
        staff: {
          include: { user: { select: { fullName: true, email: true } } },
        },
      },
      orderBy: { startAt: "desc" },
    }),
  findDayOff: (id: string) => prisma.staffDayOff.findUnique({ where: { id } }),
  createDayOff: (data: {
    staffId: string;
    startAt: Date;
    endAt: Date;
    reason?: string;
  }) => prisma.staffDayOff.create({ data }),
  updateDayOffStatus: (id: string, status: "APPROVED" | "REJECTED") =>
    prisma.staffDayOff.update({ where: { id }, data: { status } }),
  deleteDayOff: (id: string) => prisma.staffDayOff.delete({ where: { id } }),
};
