import { z } from "zod";
import { paginationSchema } from "../../../common/utils/pagination.js";
export const productListSchema = paginationSchema.extend({
  categoryId: z.string().cuid().optional(),
  isActive: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  inStock: z
    .string()
    .transform((v) => v === "true")
    .optional(),
});
export const productIdSchema = z.object({ id: z.string().cuid() });
export const productSlugSchema = z.object({ slug: z.string().min(2).max(180) });
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export const createProductSchema = z.object({
  categoryId: z.string().cuid().nullable().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  sku: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z
    .string()
    .max(500)
    .refine((v) => v.startsWith("/") || URL.canParse(v), "URL ảnh không hợp lệ")
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export const updateProductSchema = createProductSchema.partial();
