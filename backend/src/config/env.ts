import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default("/api/v1"),
  FRONTEND_URL: z.string().url().default("http://localhost:4200"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("Royal Barber <no-reply@royalbarber.local>"),
  BOOKING_INTERVAL_MINUTES: z.coerce
    .number()
    .int()
    .min(15)
    .max(120)
    .default(30),
  MAX_BOOKING_DAYS_AHEAD: z.coerce.number().int().min(1).max(365).default(30),
  MIN_CANCELLATION_HOURS: z.coerce.number().min(0).max(168).default(2),
  APP_TIMEZONE: z.string().default("Asia/Ho_Chi_Minh"),
});

export const env = envSchema.parse(process.env);
