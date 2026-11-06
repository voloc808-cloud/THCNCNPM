import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
export const orderController = {
  create: async (q: Request, r: Response) =>
    r
      .status(201)
      .json({
        success: true,
        message: "Đặt hàng thành công",
        data: await orderService.create(q.auth!.userId, q.body),
      }),
  mine: async (q: Request, r: Response) =>
    r.json({
      success: true,
      data: await orderService.list(q.query, q.auth!.userId),
    }),
  myDetail: async (q: Request, r: Response) =>
    r.json({
      success: true,
      data: await orderService.detail(String(q.params.id), q.auth!.userId),
    }),
  cancel: async (q: Request, r: Response) =>
    r.json({
      success: true,
      message: "Đã hủy đơn hàng",
      data: await orderService.setStatus(
        String(q.params.id),
        "CANCELLED",
        q.auth!.userId,
      ),
    }),
  adminList: async (q: Request, r: Response) =>
    r.json({ success: true, data: await orderService.list(q.query) }),
  adminDetail: async (q: Request, r: Response) =>
    r.json({
      success: true,
      data: await orderService.detail(String(q.params.id)),
    }),
  adminStatus: async (q: Request, r: Response) =>
    r.json({
      success: true,
      message: "Đã cập nhật trạng thái đơn",
      data: await orderService.setStatus(String(q.params.id), q.body.status),
    }),
};
