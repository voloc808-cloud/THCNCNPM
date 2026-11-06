import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../common/errors/app-error.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const productService = {
  categories: (publicOnly = false) =>
    prisma.productCategory.findMany({
      where: publicOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: publicOnly
        ? undefined
        : { _count: { select: { products: true } } },
    }),
  createCategory: (input: any) =>
    prisma.productCategory.create({
      data: { ...input, slug: input.slug ?? slugify(input.name) },
    }),
  async updateCategory(id: string, input: any) {
    await this.category(id);
    return prisma.productCategory.update({
      where: { id },
      data: {
        ...input,
        slug: input.slug ?? (input.name ? slugify(input.name) : undefined),
      },
    });
  },
  async removeCategory(id: string) {
    await this.category(id);
    return prisma.productCategory.delete({ where: { id } });
  },
  async category(id: string) {
    const item = await prisma.productCategory.findUnique({ where: { id } });
    if (!item)
      throw new AppError(404, "CATEGORY_NOT_FOUND", "Không tìm thấy danh mục");
    return item;
  },
  async list(query: any, publicOnly = false) {
    const where: Prisma.ProductWhereInput = {
      ...(publicOnly
        ? { isActive: true }
        : {
            ...(query.isActive !== undefined
              ? { isActive: query.isActive }
              : {}),
          }),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.inStock ? { stock: { gt: 0 } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { sku: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.product.count({ where }),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async detailBySlug(slug: string) {
    const item = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true },
    });
    if (!item)
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm");
    return item;
  },
  async detail(id: string) {
    const item = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!item)
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm");
    return item;
  },
  create(input: any) {
    return prisma.product.create({
      data: { ...input, slug: input.slug ?? slugify(input.name) },
      include: { category: true },
    });
  },
  async update(id: string, input: any) {
    await this.detail(id);
    return prisma.product.update({
      where: { id },
      data: {
        ...input,
        slug: input.slug ?? (input.name ? slugify(input.name) : undefined),
      },
      include: { category: true },
    });
  },
  async remove(id: string) {
    await this.detail(id);
    return prisma.product.delete({ where: { id } });
  },
};
