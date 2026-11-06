import { prisma } from "../../../config/prisma.js";
export const reviewRepository = {
  customerByUserId: (userId: string) =>
    prisma.customerProfile.findUnique({ where: { userId } }),
  createForAppointment: (
    appointmentId: string,
    customerId: string,
    rating: number,
    comment?: string,
  ) =>
    prisma.$transaction(
      async (tx) => {
        const appointment = await tx.appointment.findUnique({
          where: { id: appointmentId },
          include: { review: true },
        });
        if (!appointment) return { kind: "not_found" as const };
        if (appointment.customerId !== customerId)
          return { kind: "forbidden" as const };
        if (appointment.status !== "COMPLETED")
          return { kind: "not_completed" as const };
        if (appointment.review) return { kind: "reviewed" as const };
        const review = await tx.review.create({
          data: {
            appointmentId,
            customerId,
            staffId: appointment.staffId,
            rating,
            comment,
          },
        });
        const aggregate = await tx.review.aggregate({
          where: { staffId: appointment.staffId, isVisible: true },
          _avg: { rating: true },
        });
        await tx.staffProfile.update({
          where: { id: appointment.staffId },
          data: { averageRating: aggregate._avg.rating ?? 0 },
        });
        return { kind: "created" as const, review };
      },
      { isolationLevel: "Serializable" },
    ),
  listVisible: (staffId?: string) =>
    prisma.review.findMany({
      where: { isVisible: true, ...(staffId ? { staffId } : {}) },
      include: {
        customer: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
        staff: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  listForManagement: (staffUserId?: string) =>
    prisma.review.findMany({
      where: staffUserId ? { staff: { userId: staffUserId } } : {},
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        appointment: { select: { code: true, startAt: true } },
        customer: { select: { user: { select: { fullName: true } } } },
        staff: { select: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
};
