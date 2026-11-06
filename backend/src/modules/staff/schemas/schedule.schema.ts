import { z } from "zod";
import { DayOffStatus } from "../../../generated/prisma/enums.js";
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ phải có dạng HH:mm");
export const staffParamSchema = z.object({ staffId: z.string().cuid() });
export const shiftParamSchema = z.object({
  staffId: z.string().cuid(),
  shiftId: z.string().cuid(),
});
export const dayOffParamSchema = z.object({ id: z.string().cuid() });
export const createShiftSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: time,
  endTime: time,
  isActive: z.boolean().default(true),
});
export const updateShiftSchema = createShiftSchema.partial();
export const createDayOffSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    reason: z.string().trim().min(3).max(500).optional(),
  })
  .refine((value) => value.endAt > value.startAt, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endAt"],
  });
export const updateDayOffStatusSchema = z.object({
  status: z.enum([DayOffStatus.APPROVED, DayOffStatus.REJECTED]),
});
export type ShiftInput = z.infer<typeof createShiftSchema>;
