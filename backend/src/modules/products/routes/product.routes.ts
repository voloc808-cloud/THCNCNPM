import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { productController as c } from "../controllers/product.controller.js";
import {
  categorySchema,
  createProductSchema,
  productIdSchema,
  productListSchema,
  productSlugSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
export const publicProductRouter = Router();
publicProductRouter.get("/categories", asyncHandler(c.publicCategories));
publicProductRouter.get(
  "/",
  validate({ query: productListSchema }),
  asyncHandler(c.publicList),
);
publicProductRouter.get(
  "/:slug",
  validate({ params: productSlugSchema }),
  asyncHandler(c.publicDetail),
);
export const adminProductRouter = Router();
adminProductRouter.use(authenticate, authorize(Role.ADMIN));
adminProductRouter.get("/categories", asyncHandler(c.categories));
adminProductRouter.post(
  "/categories",
  validate({ body: categorySchema }),
  asyncHandler(c.createCategory),
);
adminProductRouter.patch(
  "/categories/:id",
  validate({ params: productIdSchema, body: categorySchema.partial() }),
  asyncHandler(c.updateCategory),
);
adminProductRouter.delete(
  "/categories/:id",
  validate({ params: productIdSchema }),
  asyncHandler(c.removeCategory),
);
adminProductRouter.get(
  "/",
  validate({ query: productListSchema }),
  asyncHandler(c.list),
);
adminProductRouter.post(
  "/",
  validate({ body: createProductSchema }),
  asyncHandler(c.create),
);
adminProductRouter.patch(
  "/:id",
  validate({ params: productIdSchema, body: updateProductSchema }),
  asyncHandler(c.update),
);
adminProductRouter.delete(
  "/:id",
  validate({ params: productIdSchema }),
  asyncHandler(c.remove),
);
