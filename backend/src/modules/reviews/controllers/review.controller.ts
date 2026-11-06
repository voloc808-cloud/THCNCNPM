import type { Request, Response } from "express";
import { reviewService } from "../services/review.service.js";
export const reviewController = {
  create: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Cảm ơn bạn đã đánh giá",
        data: await reviewService.create(
          req.auth!.userId,
          String(req.params.id),
          req.body,
        ),
      }),
  list: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await reviewService.list(
        typeof req.query.staffId === "string" ? req.query.staffId : undefined,
      ),
    }),
  listForManagement: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await reviewService.listForManagement(
        req.auth!.role === 'STAFF' ? req.auth!.userId : undefined,
      ),
    }),
};
