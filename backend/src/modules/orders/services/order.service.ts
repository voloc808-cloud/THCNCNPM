import { randomBytes } from "node:crypto";
import type { Prisma } from "../../../generated/prisma/client.js";
import { OrderStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../common/errors/app-error.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
const include = {
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  items: { include: { product: { select: { slug: true, imageUrl: true } } } },
} as const;
const code = () =>
  `RO${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;
const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  SHIPPING: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};
export const orderService = {
  async create(userId: string, input: any) {
    return prisma.$transaction(
      async (tx) => {
        const ids = input.items.map((i: any) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: ids }, isActive: true },
        });
        if (products.length !== ids.length)
          throw new AppError(
            409,
            "PRODUCT_UNAVAILABLE",
            "Có sản phẩm không còn kinh doanh",
          );
        let subtotal = 0;
        const lines = [];
        for (const inputItem of input.items) {
          const p = products.find((x) => x.id === inputItem.productId)!;
          if (p.stock < inputItem.quantity)
            throw new AppError(
              409,
              "INSUFFICIENT_STOCK",
              `${p.name} chỉ còn ${p.stock} sản phẩm`,
            );
          const changed = await tx.product.updateMany({
            where: { id: p.id, stock: { gte: inputItem.quantity } },
            data: { stock: { decrement: inputItem.quantity } },
          });
          if (changed.count !== 1)
            throw new AppError(
              409,
              "INSUFFICIENT_STOCK",
              `${p.name} vừa hết hàng`,
            );
          const lineTotal = Number(p.price) * inputItem.quantity;
          subtotal += lineTotal;
          lines.push({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            unitPrice: p.price,
            quantity: inputItem.quantity,
            lineTotal,
          });
        }
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        return tx.order.create({
          data: {
            code: code(),
            userId,
            subtotal,
            shippingFee,
            total: subtotal + shippingFee,
            recipientName: input.recipientName,
            recipientPhone: input.recipientPhone,
            shippingAddress: input.shippingAddress,
            customerNote: input.customerNote,
            items: { create: lines },
          },
          include,
        });
      },
      { isolationLevel: "Serializable", timeout: 10000 },
    );
  },
  async list(query: any, userId?: string) {
    const where: Prisma.OrderWhereInput = {
      ...(userId ? { userId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search } },
              { recipientName: { contains: query.search } },
              { recipientPhone: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async detail(id: string, userId?: string) {
    const item = await prisma.order.findUnique({ where: { id }, include });
    if (!item || (userId && item.userId !== userId))
      throw new AppError(404, "ORDER_NOT_FOUND", "Không tìm thấy đơn hàng");
    return item;
  },
  async setStatus(id: string, status: OrderStatus, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!item || (userId && item.userId !== userId))
        throw new AppError(404, "ORDER_NOT_FOUND", "Không tìm thấy đơn hàng");
      if (!transitions[item.status].includes(status))
        throw new AppError(
          409,
          "INVALID_ORDER_STATUS",
          `Không thể chuyển từ ${item.status} sang ${status}`,
        );
      if (userId && status !== OrderStatus.CANCELLED)
        throw new AppError(
          403,
          "FORBIDDEN_STATUS",
          "Khách hàng chỉ có thể hủy đơn đang chờ",
        );
      if (status === OrderStatus.CANCELLED)
        for (const line of item.items)
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { increment: line.quantity } },
          });
      return tx.order.update({ where: { id }, data: { status }, include });
    });
  },
};
