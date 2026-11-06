import { z } from "zod";
export const lookbookIdSchema = z.object({ id: z.string().cuid() });
const fields = z.object({
  title: z.string().trim().min(2).max(120),
  imageUrl: z
    .string()
    .max(500)
    .refine(
      (value) => value.startsWith("/") || URL.canParse(value),
      "URL ảnh không hợp lệ",
    ),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export const createLookbookSchema = fields;
export const updateLookbookSchema = fields.partial();
