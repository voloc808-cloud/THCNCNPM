import { z } from "zod";
export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});
export const reviewAppointmentParamSchema = z.object({ id: z.string().cuid() });
