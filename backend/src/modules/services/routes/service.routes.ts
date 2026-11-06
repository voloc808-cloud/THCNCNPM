import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { serviceController } from "../controllers/service.controller.js";
import {
  createServiceSchema,
  serviceIdSchema,
  serviceListSchema,
  updateServiceSchema,
} from "../schemas/service.schema.js";
export const publicServiceRouter = Router();
publicServiceRouter.get(
  "/",
  validate({ query: serviceListSchema }),
  asyncHandler(serviceController.publicList),
);
publicServiceRouter.get(
  "/:id",
  validate({ params: serviceIdSchema }),
  asyncHandler(serviceController.publicDetail),
);
export const adminServiceRouter = Router();
adminServiceRouter.use(authenticate, authorize(Role.ADMIN));
adminServiceRouter.get(
  "/",
  validate({ query: serviceListSchema }),
  asyncHandler(serviceController.list),
);
adminServiceRouter.get(
  "/:id",
  validate({ params: serviceIdSchema }),
  asyncHandler(serviceController.detail),
);
adminServiceRouter.post(
  "/",
  validate({ body: createServiceSchema }),
  asyncHandler(serviceController.create),
);
adminServiceRouter.patch(
  "/:id",
  validate({ params: serviceIdSchema, body: updateServiceSchema }),
  asyncHandler(serviceController.update),
);
adminServiceRouter.delete(
  "/:id",
  validate({ params: serviceIdSchema }),
  asyncHandler(serviceController.remove),
);
