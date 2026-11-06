import { z } from "zod";
import { paginationSchema } from "../../../common/utils/pagination.js";
import { UserStatus } from "../../../generated/prisma/enums.js";
export const customerListSchema = paginationSchema.extend({
  status: z.nativeEnum(UserStatus).optional(),
});
export const customerIdSchema = z.object({ id: z.string().cuid() });
const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/);
export const createCustomerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password,
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/)
    .optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  dateOfBirth: z.coerce.date().max(new Date()).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});
export const updateCustomerSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/)
    .nullable()
    .optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  dateOfBirth: z.coerce.date().max(new Date()).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  loyaltyPoint: z.coerce.number().int().min(0).optional(),
});
export const setCustomerPasswordSchema = z.object({ newPassword: password });
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
