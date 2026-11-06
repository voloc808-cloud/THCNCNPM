import { Router } from "express";
import { z } from "zod";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { reviewController } from "../controllers/review.controller.js";
import {
  createReviewSchema,
  reviewAppointmentParamSchema,
} from "../schemas/review.schema.js";
export const reviewRouter = Router();
reviewRouter.get(
  "/management",
  authenticate,
  authorize(Role.ADMIN, Role.STAFF),
  asyncHandler(reviewController.listForManagement),
);
reviewRouter.get(
  "/",
  validate({ query: z.object({ staffId: z.string().cuid().optional() }) }),
  asyncHandler(reviewController.list),
);
reviewRouter.post(
  "/appointments/:id",
  authenticate,
  authorize(Role.CUSTOMER),
  validate({ params: reviewAppointmentParamSchema, body: createReviewSchema }),
  asyncHandler(reviewController.create),
);
