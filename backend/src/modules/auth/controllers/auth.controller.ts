import type { Request, Response } from "express";
import { env } from "../../../config/env.js";
import { authService } from "../services/auth.service.js";
export const authController = {
  register: async (req: Request, res: Response) =>
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: await authService.register(req.body),
    }),
  googleConfig: async (_req: Request, res: Response) =>
    res.json({ success: true, data: { clientId: env.GOOGLE_CLIENT_ID } }),
  googleLogin: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Đăng nhập Google thành công",
      data: await authService.googleLogin(req.body.credential),
    }),
  login: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: await authService.login(req.body.email, req.body.password),
    }),
  refresh: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await authService.refresh(req.body.refreshToken),
    }),
  logout: async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, message: "Đăng xuất thành công" });
  },
  forgotPassword: async (req: Request, res: Response) => {
    const token = await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi",
      ...(env.NODE_ENV === "development" && token
        ? { developmentResetToken: token }
        : {}),
    });
  },
  resetPassword: async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  },
  changePassword: async (req: Request, res: Response) => {
    await authService.changePassword(
      req.auth!.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.json({
      success: true,
      message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại",
    });
  },
  getProfile: async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await authService.getProfile(req.auth!.userId),
    }),
  updateProfile: async (req: Request, res: Response) =>
    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      data: await authService.updateProfile(req.auth!.userId, req.body),
    }),
};
