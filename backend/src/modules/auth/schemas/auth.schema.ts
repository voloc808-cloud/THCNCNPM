import { z } from "zod";
const password = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72)
  .regex(/[A-Z]/, "Mật khẩu cần ít nhất một chữ hoa")
  .regex(/[a-z]/, "Mật khẩu cần ít nhất một chữ thường")
  .regex(/[0-9]/, "Mật khẩu cần ít nhất một chữ số");
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password,
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/)
    .optional(),
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export const googleLoginSchema = z.object({ credential: z.string().min(100) });
export const refreshSchema = z.object({ refreshToken: z.string().min(20) });
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: password,
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+]{9,15}$/)
    .nullable()
    .optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  dateOfBirth: z.coerce.date().max(new Date()).nullable().optional(),
  bio: z.string().trim().max(5000).nullable().optional(),
  specialties: z.string().trim().max(500).nullable().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(60).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
