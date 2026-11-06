import type { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../../common/errors/app-error.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
import { serviceRepository } from "../repositories/service.repository.js";
import type { ServiceInput } from "../schemas/service.schema.js";
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const serviceService = {
  async list(
    query: { page: number; limit: number; search?: string; isActive?: boolean },
    publicOnly = false,
  ) {
    const where: Prisma.ServiceWhereInput = {
      ...(publicOnly
        ? { isActive: true }
        : query.isActive !== undefined
          ? { isActive: query.isActive }
          : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [items, total] = await serviceRepository.list(
      where,
      (query.page - 1) * query.limit,
      query.limit,
    );
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async detail(id: string, publicOnly = false) {
    const item = await serviceRepository.findById(id);
    if (!item || (publicOnly && !item.isActive))
      throw new AppError(404, "SERVICE_NOT_FOUND", "Không tìm thấy dịch vụ");
    return item;
  },
  create(input: ServiceInput) {
    return serviceRepository.create({
      ...input,
      slug: input.slug ?? slugify(input.name),
    });
  },
  async update(id: string, input: Partial<ServiceInput>) {
    await this.detail(id);
    return serviceRepository.update(id, {
      ...input,
      slug: input.slug ?? (input.name ? slugify(input.name) : undefined),
    });
  },
  async remove(id: string) {
    await this.detail(id);
    await serviceRepository.remove(id);
  },
};
