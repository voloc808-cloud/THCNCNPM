import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { appointmentController } from "../controllers/appointment.controller.js";
import {
  adminCreateAppointmentSchema,
  appointmentIdSchema,
  appointmentListSchema,
  availabilityQuerySchema,
  cancellationSchema,
  createAppointmentSchema,
  rescheduleSchema,
  updateStatusSchema,
} from "../schemas/appointment.schema.js";
export const availabilityRouter = Router();
availabilityRouter.get(
  "/",
  validate({ query: availabilityQuerySchema }),
  asyncHandler(appointmentController.availability),
);
export const customerAppointmentRouter = Router();
customerAppointmentRouter.use(authenticate, authorize(Role.CUSTOMER));
customerAppointmentRouter.get(
  "/",
  validate({ query: appointmentListSchema }),
  asyncHandler(appointmentController.customerList),
);
customerAppointmentRouter.post(
  "/",
  validate({ body: createAppointmentSchema }),
  asyncHandler(appointmentController.create),
);
customerAppointmentRouter.get(
  "/:id",
  validate({ params: appointmentIdSchema }),
  asyncHandler(appointmentController.detail),
);
customerAppointmentRouter.patch(
  "/:id/cancel",
  validate({ params: appointmentIdSchema, body: cancellationSchema }),
  asyncHandler(appointmentController.cancel),
);
export const staffAppointmentRouter = Router();
staffAppointmentRouter.use(authenticate, authorize(Role.STAFF));
staffAppointmentRouter.get(
  "/",
  validate({ query: appointmentListSchema }),
  asyncHandler(appointmentController.staffList),
);
staffAppointmentRouter.get(
  "/:id",
  validate({ params: appointmentIdSchema }),
  asyncHandler(appointmentController.detail),
);
staffAppointmentRouter.patch(
  "/:id/status",
  validate({ params: appointmentIdSchema, body: updateStatusSchema }),
  asyncHandler(appointmentController.staffStatus),
);
export const adminAppointmentRouter = Router();
adminAppointmentRouter.use(authenticate, authorize(Role.ADMIN));
adminAppointmentRouter.get(
  "/",
  validate({ query: appointmentListSchema }),
  asyncHandler(appointmentController.adminList),
);
adminAppointmentRouter.post(
  "/",
  validate({ body: adminCreateAppointmentSchema }),
  asyncHandler(appointmentController.adminCreate),
);
adminAppointmentRouter.get(
  "/:id",
  validate({ params: appointmentIdSchema }),
  asyncHandler(appointmentController.detail),
);
adminAppointmentRouter.patch(
  "/:id/status",
  validate({
    params: appointmentIdSchema,
    body: updateStatusSchema.extend({
      reason: cancellationSchema.shape.reason.optional(),
    }),
  }),
  asyncHandler(appointmentController.adminStatus),
);
adminAppointmentRouter.patch(
  "/:id/reschedule",
  validate({ params: appointmentIdSchema, body: rescheduleSchema }),
  asyncHandler(appointmentController.reschedule),
);
