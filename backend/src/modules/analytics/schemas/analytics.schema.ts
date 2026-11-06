import { z } from "zod";
export const analyticsQuerySchema = z
  .object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine((v) => !v.dateFrom || !v.dateTo || v.dateTo >= v.dateFrom, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
  });
