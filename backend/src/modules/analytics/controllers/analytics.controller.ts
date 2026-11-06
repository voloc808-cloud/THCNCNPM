import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
export const analyticsController = {
  summary: async (q: Request, r: Response) =>
    r.json({ success: true, data: await analyticsService.summary(q.query) }),
  csv: async (q: Request, r: Response) => {
    const csv = await analyticsService.csv(q.query);
    r.setHeader("Content-Type", "text/csv; charset=utf-8");
    r.setHeader(
      "Content-Disposition",
      'attachment; filename="royal-barber-report.csv"',
    );
    r.send(csv);
  },
};
