import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { analyticsController as c } from "../controllers/analytics.controller.js";
import { analyticsQuerySchema } from "../schemas/analytics.schema.js";
export const analyticsRouter = Router();
analyticsRouter.use(authenticate, authorize(Role.ADMIN));
analyticsRouter.get(
  "/summary",
  validate({ query: analyticsQuerySchema }),
  asyncHandler(c.summary),
);
analyticsRouter.get(
  "/export.csv",
  validate({ query: analyticsQuerySchema }),
  asyncHandler(c.csv),
);
