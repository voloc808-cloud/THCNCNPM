import type { Request, Response } from "express";
import { staffService } from "../services/staff.service.js";
export const staffController = {
  publicList: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await staffService.list(req.query as never, true),
    }),
  publicDetail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await staffService.detail(String(req.params.id), true),
    }),
  list: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await staffService.list(req.query as never),
    }),
  detail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await staffService.detail(String(req.params.id)),
    }),
  create: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo nhân viên thành công",
        data: await staffService.create(req.body),
      }),
  update: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: await staffService.update(String(req.params.id), req.body),
    }),
  remove: async (req: Request, res: Response) => {
    await staffService.remove(String(req.params.id));
    res.status(204).send();
  },
};
