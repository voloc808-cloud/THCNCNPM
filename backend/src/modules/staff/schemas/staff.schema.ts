import { z } from "zod";
import { paginationSchema } from "../../../common/utils/pagination.js";
import { UserStatus } from "../../../generated/prisma/enums.js";
const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/);
export const staffListSchema = paginationSchema.extend({
  isBookable: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  status: z.nativeEnum(UserStatus).optional(),
});
export const staffIdSchema = z.object({ id: z.string().cuid() });
export const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password,
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/)
    .optional(),
  avatarUrl: z
    .string()
    .max(500)
    .refine(
      (value) => value.startsWith("/") || URL.canParse(value),
      "URL ảnh không hợp lệ",
    )
    .nullable()
    .optional(),
  bio: z.string().trim().max(5000).nullable().optional(),
  specialties: z.string().trim().max(500).nullable().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(60).default(0),
  isBookable: z.boolean().default(true),
  serviceIds: z.array(z.string().cuid()).default([]),
});
export const updateStaffSchema = createStaffSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: password.optional(),
    status: z.nativeEnum(UserStatus).optional(),
  });
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
