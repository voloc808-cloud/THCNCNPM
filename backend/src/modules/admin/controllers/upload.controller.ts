import type { Request, Response } from "express";
import { AppError } from "../../../common/errors/app-error.js";
export const uploadImage = async (request: Request, response: Response) => {
  if (!request.file)
    throw new AppError(422, "IMAGE_REQUIRED", "Vui lòng chọn ảnh để tải lên");
  response.status(201).json({
    success: true,
    message: "Tải ảnh thành công",
    data: {
      filename: request.file.filename,
      imageUrl: `/uploads/${request.file.filename}`,
    },
  });
};
