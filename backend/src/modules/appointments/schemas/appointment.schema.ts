import { z } from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums.js";
import { paginationSchema } from "../../../common/utils/pagination.js";
const serviceIds = z
  .array(z.string().cuid())
  .min(1)
  .max(10)
  .transform((ids) => [...new Set(ids)]);
export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.preprocess(
    (value) =>
      typeof value === "string" ? value.split(",").filter(Boolean) : value,
    serviceIds,
  ),
  staffId: z.string().cuid().optional(),
});
export const createAppointmentSchema = z.object({
  serviceIds,
  staffId: z.string().cuid().nullable().optional(),
  startAt: z.coerce.date(),
  customerNote: z.string().trim().max(1000).optional(),
});
export const adminCreateAppointmentSchema = createAppointmentSchema.extend({
  customerId: z.string().cuid(),
});
export const appointmentIdSchema = z.object({ id: z.string().cuid() });
export const appointmentListSchema = paginationSchema.extend({
  status: z.nativeEnum(AppointmentStatus).optional(),
  staffId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export const cancellationSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});
export const rescheduleSchema = z.object({
  staffId: z.string().cuid().optional(),
  startAt: z.coerce.date(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentListInput = z.infer<typeof appointmentListSchema>;
