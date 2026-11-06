import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/prisma.js";
const include = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  services: { include: { service: true } },
} as const;
export const staffRepository = {
  list: (where: Prisma.StaffProfileWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.staffProfile.findMany({
        where,
        skip,
        take,
        include,
        orderBy: { user: { fullName: "asc" } },
      }),
      prisma.staffProfile.count({ where }),
    ]),
  findById: (id: string) =>
    prisma.staffProfile.findUnique({ where: { id }, include }),
  create: (data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string | null;
    bio?: string | null;
    specialties?: string | null;
    yearsOfExperience: number;
    isBookable: boolean;
    serviceIds: string[];
  }) =>
    prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        role: "STAFF",
        staffProfile: {
          create: {
            bio: data.bio,
            specialties: data.specialties,
            yearsOfExperience: data.yearsOfExperience,
            isBookable: data.isBookable,
            services: {
              create: data.serviceIds.map((serviceId) => ({
                service: { connect: { id: serviceId } },
              })),
            },
          },
        },
      },
      include: { staffProfile: { include } },
    }),
  update: (
    id: string,
    data: {
      user: Prisma.UserUpdateInput;
      profile: Prisma.StaffProfileUpdateInput;
      serviceIds?: string[];
    },
  ) =>
    prisma.$transaction(async (tx) => {
      const current = await tx.staffProfile.findUnique({ where: { id } });
      if (!current) return null;
      await tx.user.update({ where: { id: current.userId }, data: data.user });
      await tx.staffProfile.update({ where: { id }, data: data.profile });
      if (data.serviceIds) {
        await tx.staffService.deleteMany({ where: { staffId: id } });
        await tx.staffService.createMany({
          data: data.serviceIds.map((serviceId) => ({
            staffId: id,
            serviceId,
          })),
          skipDuplicates: true,
        });
      }
      return tx.staffProfile.findUnique({ where: { id }, include });
    }),
  remove: async (id: string) => {
    const staff = await prisma.staffProfile.findUnique({ where: { id } });
    if (staff) await prisma.user.delete({ where: { id: staff.userId } });
    return staff;
  },
};
