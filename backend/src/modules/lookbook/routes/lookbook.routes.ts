import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { lookbookController as controller } from "../controllers/lookbook.controller.js";
import {
  createLookbookSchema,
  lookbookIdSchema,
  updateLookbookSchema,
} from "../schemas/lookbook.schema.js";
export const publicLookbookRouter = Router();
publicLookbookRouter.get("/", asyncHandler(controller.publicList));
export const adminLookbookRouter = Router();
adminLookbookRouter.use(authenticate, authorize(Role.ADMIN));
adminLookbookRouter.get("/", asyncHandler(controller.list));
adminLookbookRouter.post(
  "/",
  validate({ body: createLookbookSchema }),
  asyncHandler(controller.create),
);
adminLookbookRouter.patch(
  "/:id",
  validate({ params: lookbookIdSchema, body: updateLookbookSchema }),
  asyncHandler(controller.update),
);
adminLookbookRouter.delete(
  "/:id",
  validate({ params: lookbookIdSchema }),
  asyncHandler(controller.remove),
);
