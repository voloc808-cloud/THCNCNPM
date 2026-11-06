import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/prisma.js";
export const serviceRepository = {
  list: (where: Prisma.ServiceWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.service.count({ where }),
    ]),
  findById: (id: string) =>
    prisma.service.findUnique({
      where: { id },
      include: {
        staff: {
          include: {
            staff: {
              include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    }),
  create: (data: Prisma.ServiceCreateInput) => prisma.service.create({ data }),
  update: (id: string, data: Prisma.ServiceUpdateInput) =>
    prisma.service.update({ where: { id }, data }),
  remove: (id: string) => prisma.service.delete({ where: { id } }),
};
