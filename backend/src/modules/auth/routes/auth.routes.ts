import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { authenticate } from "../../../common/middleware/auth.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authController } from "../controllers/auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";
const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "TOO_MANY_REQUESTS",
    message: "Bạn thao tác quá nhanh, vui lòng thử lại sau",
  },
});
router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);
router.get("/google/config", asyncHandler(authController.googleConfig));
router.post(
  "/google",
  authLimiter,
  validate({ body: googleLoginSchema }),
  asyncHandler(authController.googleLogin),
);
router.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(authController.refresh),
);
router.post(
  "/logout",
  validate({ body: refreshSchema }),
  asyncHandler(authController.logout),
);
router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword),
);
router.post(
  "/reset-password",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);
router.post(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
);
router.get("/me", authenticate, asyncHandler(authController.getProfile));
router.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(authController.updateProfile),
);
export { router as authRouter };
