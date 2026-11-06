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
  _count: { select: { appointments: true, reviews: true } },
} as const;
export const customerRepository = {
  list: (where: Prisma.CustomerProfileWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.customerProfile.findMany({
        where,
        skip,
        take,
        include,
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.customerProfile.count({ where }),
    ]),
  findById: (id: string) =>
    prisma.customerProfile.findUnique({ where: { id }, include }),
  create: (data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string | null;
    dateOfBirth?: Date | null;
    notes?: string | null;
  }) =>
    prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        role: "CUSTOMER",
        customerProfile: {
          create: { dateOfBirth: data.dateOfBirth, notes: data.notes },
        },
      },
      include: { customerProfile: { include } },
    }),
  update: (
    id: string,
    data: {
      user: Prisma.UserUpdateInput;
      profile: Prisma.CustomerProfileUpdateInput;
    },
  ) =>
    prisma.$transaction(async (tx) => {
      const current = await tx.customerProfile.findUnique({ where: { id } });
      if (!current) return null;
      await tx.user.update({ where: { id: current.userId }, data: data.user });
      await tx.customerProfile.update({ where: { id }, data: data.profile });
      return tx.customerProfile.findUnique({ where: { id }, include });
    }),
  remove: async (id: string) => {
    const customer = await prisma.customerProfile.findUnique({ where: { id } });
    if (customer) await prisma.user.delete({ where: { id: customer.userId } });
    return customer;
  },
};
