import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { staffController } from "../controllers/staff.controller.js";
import {
  createStaffSchema,
  staffIdSchema,
  staffListSchema,
  updateStaffSchema,
} from "../schemas/staff.schema.js";
export const publicStaffRouter = Router();
publicStaffRouter.get(
  "/",
  validate({ query: staffListSchema }),
  asyncHandler(staffController.publicList),
);
publicStaffRouter.get(
  "/:id",
  validate({ params: staffIdSchema }),
  asyncHandler(staffController.publicDetail),
);
export const adminStaffRouter = Router();
adminStaffRouter.use(authenticate, authorize(Role.ADMIN));
adminStaffRouter.get(
  "/",
  validate({ query: staffListSchema }),
  asyncHandler(staffController.list),
);
adminStaffRouter.get(
  "/:id",
  validate({ params: staffIdSchema }),
  asyncHandler(staffController.detail),
);
adminStaffRouter.post(
  "/",
  validate({ body: createStaffSchema }),
  asyncHandler(staffController.create),
);
adminStaffRouter.patch(
  "/:id",
  validate({ params: staffIdSchema, body: updateStaffSchema }),
  asyncHandler(staffController.update),
);
adminStaffRouter.delete(
  "/:id",
  validate({ params: staffIdSchema }),
  asyncHandler(staffController.remove),
);
