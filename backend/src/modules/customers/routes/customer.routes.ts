import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { customerController } from "../controllers/customer.controller.js";
import {
  createCustomerSchema,
  customerIdSchema,
  customerListSchema,
  updateCustomerSchema,
  setCustomerPasswordSchema,
} from "../schemas/customer.schema.js";
const router = Router();
router.use(authenticate, authorize(Role.ADMIN));
router.post(
  "/",
  validate({ body: createCustomerSchema }),
  asyncHandler(customerController.create),
);
router.get(
  "/",
  validate({ query: customerListSchema }),
  asyncHandler(customerController.list),
);
router.get(
  "/:id",
  validate({ params: customerIdSchema }),
  asyncHandler(customerController.detail),
);
router.patch(
  "/:id",
  validate({ params: customerIdSchema, body: updateCustomerSchema }),
  asyncHandler(customerController.update),
);
router.patch(
  "/:id/password",
  validate({ params: customerIdSchema, body: setCustomerPasswordSchema }),
  asyncHandler(customerController.setPassword),
);
router.delete(
  "/:id",
  validate({ params: customerIdSchema }),
  asyncHandler(customerController.remove),
);
export { router as adminCustomerRouter };
