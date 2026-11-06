import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
export const notFoundHandler: RequestHandler = (request, _response, next) =>
  next(
    new AppError(
      404,
      "ROUTE_NOT_FOUND",
      `Không tìm thấy ${request.method} ${request.originalUrl}`,
    ),
  );
export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Dữ liệu không hợp lệ",
      errors: error.issues,
    });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const duplicate = error.code === "P2002";
    response.status(duplicate ? 409 : 400).json({
      success: false,
      code: duplicate ? "DUPLICATE_DATA" : "DATABASE_ERROR",
      message: duplicate
        ? "Dữ liệu đã tồn tại trong hệ thống"
        : "Không thể thực hiện thao tác với dữ liệu này",
    });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }
  console.error(error);
  response.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
  });
};
