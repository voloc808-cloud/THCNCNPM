import type { Request, Response } from "express";
import { serviceService } from "../services/service.service.js";
export const serviceController = {
  publicList: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await serviceService.list(req.query as never, true),
    }),
  publicDetail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await serviceService.detail(String(req.params.id), true),
    }),
  list: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await serviceService.list(req.query as never),
    }),
  detail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await serviceService.detail(String(req.params.id)),
    }),
  create: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo dịch vụ thành công",
        data: await serviceService.create(req.body),
      }),
  update: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật dịch vụ thành công",
      data: await serviceService.update(String(req.params.id), req.body),
    }),
  remove: async (req: Request, res: Response) => {
    await serviceService.remove(String(req.params.id));
    res.status(204).send();
  },
};
