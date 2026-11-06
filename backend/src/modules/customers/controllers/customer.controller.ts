import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";
export const customerController = {
  create: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo khách hàng thành công",
        data: await customerService.create(req.body),
      }),
  list: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await customerService.list(req.query as never),
    }),
  detail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await customerService.detail(String(req.params.id)),
    }),
  update: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật khách hàng thành công",
      data: await customerService.update(String(req.params.id), req.body),
    }),
  setPassword: async (req: Request, res: Response) => {
    await customerService.setPassword(String(req.params.id), req.body.newPassword);
    res.json({ success: true, message: "Đã đổi mật khẩu khách hàng" });
  },
  remove: async (req: Request, res: Response) => {
    await customerService.remove(String(req.params.id));
    res.status(204).send();
  },
};
