import { z } from "zod";
import { OrderStatus } from "../../../generated/prisma/enums.js";
import { paginationSchema } from "../../../common/utils/pagination.js";
export const orderIdSchema = z.object({ id: z.string().cuid() });
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(30)
    .transform((items) => {
      const map = new Map<string, number>();
      for (const i of items)
        map.set(i.productId, (map.get(i.productId) ?? 0) + i.quantity);
      return [...map].map(([productId, quantity]) => ({ productId, quantity }));
    }),
  recipientName: z.string().trim().min(2).max(120),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/),
  shippingAddress: z.string().trim().min(10).max(500),
  customerNote: z.string().trim().max(1000).optional(),
});
export const orderListSchema = paginationSchema.extend({
  status: z.nativeEnum(OrderStatus).optional(),
});
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
