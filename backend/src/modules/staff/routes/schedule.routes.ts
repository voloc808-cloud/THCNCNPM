import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { scheduleController } from "../controllers/schedule.controller.js";
import {
  createDayOffSchema,
  createShiftSchema,
  dayOffParamSchema,
  shiftParamSchema,
  staffParamSchema,
  updateDayOffStatusSchema,
  updateShiftSchema,
} from "../schemas/schedule.schema.js";
export const staffScheduleRouter = Router();
staffScheduleRouter.use(authenticate, authorize(Role.STAFF));
staffScheduleRouter.get("/shifts", asyncHandler(scheduleController.ownShifts));
staffScheduleRouter.get(
  "/days-off",
  asyncHandler(scheduleController.ownDaysOff),
);
staffScheduleRouter.post(
  "/days-off",
  validate({ body: createDayOffSchema }),
  asyncHandler(scheduleController.requestDayOff),
);
staffScheduleRouter.delete(
  "/days-off/:id",
  validate({ params: dayOffParamSchema }),
  asyncHandler(scheduleController.cancelDayOff),
);
export const adminScheduleRouter = Router();
adminScheduleRouter.use(authenticate, authorize(Role.ADMIN));
adminScheduleRouter.get(
  "/days-off",
  asyncHandler(scheduleController.allDaysOff),
);
adminScheduleRouter.patch(
  "/days-off/:id",
  validate({ params: dayOffParamSchema, body: updateDayOffStatusSchema }),
  asyncHandler(scheduleController.reviewDayOff),
);
adminScheduleRouter.get(
  "/staff/:staffId/shifts",
  validate({ params: staffParamSchema }),
  asyncHandler(scheduleController.staffShifts),
);
adminScheduleRouter.post(
  "/staff/:staffId/shifts",
  validate({ params: staffParamSchema, body: createShiftSchema }),
  asyncHandler(scheduleController.createShift),
);
adminScheduleRouter.patch(
  "/staff/:staffId/shifts/:shiftId",
  validate({ params: shiftParamSchema, body: updateShiftSchema }),
  asyncHandler(scheduleController.updateShift),
);
adminScheduleRouter.delete(
  "/staff/:staffId/shifts/:shiftId",
  validate({ params: shiftParamSchema }),
  asyncHandler(scheduleController.deleteShift),
);
