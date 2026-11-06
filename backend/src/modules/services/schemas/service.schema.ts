import { z } from "zod";
import { paginationSchema } from "../../../common/utils/pagination.js";
export const serviceListSchema = paginationSchema.extend({
  isActive: z
    .string()
    .transform((v) => v === "true")
    .optional(),
});
export const serviceIdSchema = z.object({ id: z.string().cuid() });
export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().positive().max(9999999999),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  imageUrl: z.string().url().max(500).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export const updateServiceSchema = createServiceSchema.partial();
export type ServiceInput = z.infer<typeof createServiceSchema>;
