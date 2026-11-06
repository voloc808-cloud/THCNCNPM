import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../common/errors/app-error.js";
export const lookbookService = {
  publicList: () =>
    prisma.lookbookItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      take: 4,
    }),
  list: () =>
    prisma.lookbookItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  create: (data: {
    title: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: number;
  }) => prisma.lookbookItem.create({ data }),
  async update(
    id: string,
    data: {
      title?: string;
      imageUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    await this.detail(id);
    return prisma.lookbookItem.update({ where: { id }, data });
  },
  async remove(id: string) {
    await this.detail(id);
    return prisma.lookbookItem.delete({ where: { id } });
  },
  async detail(id: string) {
    const item = await prisma.lookbookItem.findUnique({ where: { id } });
    if (!item)
      throw new AppError(404, "LOOKBOOK_NOT_FOUND", "Không tìm thấy kiểu tóc");
    return item;
  },
};
