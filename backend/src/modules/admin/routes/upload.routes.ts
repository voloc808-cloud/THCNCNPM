import { randomUUID } from "node:crypto";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { Role } from "../../../generated/prisma/enums.js";
import {
  authenticate,
  authorize,
} from "../../../common/middleware/auth.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";
import { AppError } from "../../../common/errors/app-error.js";
import { uploadImage } from "../controllers/upload.controller.js";
const uploadDirectory = path.resolve(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) =>
    callback(
      null,
      `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
    ),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
      return callback(
        new AppError(
          422,
          "INVALID_IMAGE_TYPE",
          "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP",
        ),
      );
    callback(null, true);
  },
});
const router = Router();
router.post(
  "/images",
  authenticate,
  authorize(Role.ADMIN),
  upload.single("image"),
  asyncHandler(uploadImage),
);
export { router as uploadRouter };
