import type { Request, Response } from "express";
import { appointmentService } from "../services/appointment.service.js";
export const appointmentController = {
  availability: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await appointmentService.availability(req.query as never),
    }),
  create: async (req: Request, res: Response) =>
    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công",
      data: await appointmentService.createForCustomer(
        req.auth!.userId,
        req.body,
      ),
    }),
  adminCreate: async (req: Request, res: Response) =>
    res.status(201).json({
      success: true,
      message: "Đặt lịch tại quầy thành công",
      data: await appointmentService.createByAdmin(
        req.body.customerId,
        req.body,
      ),
    }),
  customerList: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await appointmentService.listCustomer(
        req.auth!.userId,
        req.query as never,
      ),
    }),
  staffList: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await appointmentService.listStaff(
        req.auth!.userId,
        req.query as never,
      ),
    }),
  adminList: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await appointmentService.list(req.query as never),
    }),
  detail: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await appointmentService.detailForUser(
        String(req.params.id),
        req.auth!,
      ),
    }),
  cancel: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Hủy lịch thành công",
      data: await appointmentService.cancelByCustomer(
        String(req.params.id),
        req.auth!.userId,
        req.body.reason,
      ),
    }),
  staffStatus: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: await appointmentService.updateStatusByStaff(
        String(req.params.id),
        req.auth!.userId,
        req.body.status,
      ),
    }),
  adminStatus: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: await appointmentService.updateStatus(
        String(req.params.id),
        req.body.status,
        req.auth!.role,
        req.body.reason,
      ),
    }),
  reschedule: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Đổi lịch thành công",
      data: await appointmentService.reschedule(
        String(req.params.id),
        req.body,
      ),
    }),
};
