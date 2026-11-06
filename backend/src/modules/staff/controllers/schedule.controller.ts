import type { Request, Response } from "express";
import { scheduleService } from "../services/schedule.service.js";
export const scheduleController = {
  ownShifts: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await scheduleService.listOwnShifts(req.auth!.userId),
    }),
  staffShifts: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await scheduleService.listStaffShifts(String(req.params.staffId)),
    }),
  createShift: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo ca làm việc thành công",
        data: await scheduleService.createShift(
          String(req.params.staffId),
          req.body,
        ),
      }),
  updateShift: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật ca làm việc thành công",
      data: await scheduleService.updateShift(
        String(req.params.staffId),
        String(req.params.shiftId),
        req.body,
      ),
    }),
  deleteShift: async (req: Request, res: Response) => {
    await scheduleService.deleteShift(
      String(req.params.staffId),
      String(req.params.shiftId),
    );
    res.status(204).send();
  },
  ownDaysOff: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await scheduleService.listOwnDaysOff(req.auth!.userId),
    }),
  requestDayOff: async (req: Request, res: Response) =>
    res
      .status(201)
      .json({
        success: true,
        message: "Đã gửi yêu cầu nghỉ",
        data: await scheduleService.requestDayOff(req.auth!.userId, req.body),
      }),
  cancelDayOff: async (req: Request, res: Response) => {
    await scheduleService.cancelOwnDayOff(
      req.auth!.userId,
      String(req.params.id),
    );
    res.status(204).send();
  },
  allDaysOff: async (_req: Request, res: Response) =>
    res.json({ success: true, data: await scheduleService.listAllDaysOff() }),
  reviewDayOff: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Đã xử lý yêu cầu nghỉ",
      data: await scheduleService.updateDayOffStatus(
        String(req.params.id),
        req.body.status,
      ),
    }),
};
