import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums.js";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";
type AccessPayload = jwt.JwtPayload & {
  sub: string;
  role: Role;
  type: "access";
};
export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer "))
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Vui lòng đăng nhập để tiếp tục",
    );
  try {
    const payload = jwt.verify(
      authorization.slice(7),
      env.JWT_ACCESS_SECRET,
    ) as AccessPayload;
    if (payload.type !== "access" || !payload.sub || !payload.role)
      throw new Error("Invalid token");
    request.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(
      401,
      "INVALID_ACCESS_TOKEN",
      "Access token không hợp lệ hoặc đã hết hạn",
    );
  }
};
export const authorize =
  (...roles: Role[]): RequestHandler =>
  (request, _response, next) => {
    if (!request.auth)
      throw new AppError(
        401,
        "UNAUTHENTICATED",
        "Vui lòng đăng nhập để tiếp tục",
      );
    if (!roles.includes(request.auth.role))
      throw new AppError(
        403,
        "FORBIDDEN",
        "Bạn không có quyền thực hiện thao tác này",
      );
    next();
  };
