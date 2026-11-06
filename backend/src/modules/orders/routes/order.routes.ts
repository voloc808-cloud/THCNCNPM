import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { orderController as c } from "../controllers/order.controller.js";
import {
  createOrderSchema,
  orderIdSchema,
  orderListSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema.js";
export const customerOrderRouter = Router();
customerOrderRouter.use(authenticate, authorize(Role.CUSTOMER));
customerOrderRouter.get(
  "/",
  validate({ query: orderListSchema }),
  asyncHandler(c.mine),
);
customerOrderRouter.post(
  "/",
  validate({ body: createOrderSchema }),
  asyncHandler(c.create),
);
customerOrderRouter.get(
  "/:id",
  validate({ params: orderIdSchema }),
  asyncHandler(c.myDetail),
);
customerOrderRouter.patch(
  "/:id/cancel",
  validate({ params: orderIdSchema }),
  asyncHandler(c.cancel),
);
export const adminOrderRouter = Router();
adminOrderRouter.use(authenticate, authorize(Role.ADMIN));
adminOrderRouter.get(
  "/",
  validate({ query: orderListSchema }),
  asyncHandler(c.adminList),
);
adminOrderRouter.get(
  "/:id",
  validate({ params: orderIdSchema }),
  asyncHandler(c.adminDetail),
);
adminOrderRouter.patch(
  "/:id/status",
  validate({ params: orderIdSchema, body: updateOrderStatusSchema }),
  asyncHandler(c.adminStatus),
);
