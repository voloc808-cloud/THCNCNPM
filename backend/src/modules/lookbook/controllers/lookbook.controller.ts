import type { Request, Response } from "express";
import { lookbookService } from "../services/lookbook.service.js";
export const lookbookController = {
  publicList: async (_request: Request, response: Response) =>
    response.json({ success: true, data: await lookbookService.publicList() }),
  list: async (_request: Request, response: Response) =>
    response.json({ success: true, data: await lookbookService.list() }),
  create: async (request: Request, response: Response) =>
    response.status(201).json({
      success: true,
      message: "Đã thêm kiểu tóc",
      data: await lookbookService.create(request.body),
    }),
  update: async (request: Request, response: Response) =>
    response.json({
      success: true,
      message: "Đã cập nhật kiểu tóc",
      data: await lookbookService.update(
        String(request.params.id),
        request.body,
      ),
    }),
  remove: async (request: Request, response: Response) => {
    await lookbookService.remove(String(request.params.id));
    response.status(204).send();
  },
};
