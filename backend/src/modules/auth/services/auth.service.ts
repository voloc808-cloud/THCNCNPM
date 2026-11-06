import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Role, UserStatus } from "../../../generated/prisma/enums.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../common/errors/app-error.js";
import { createOpaqueToken, hashToken } from "../../../common/utils/crypto.js";
import { authRepository } from "../repositories/auth.repository.js";
import type {
  RegisterInput,
  UpdateProfileInput,
} from "../schemas/auth.schema.js";

const googleClient = new OAuth2Client();
const publicUser = <T extends { passwordHash: string }>(user: T) => {
  const { passwordHash: _, ...safe } = user;
  return safe;
};
const signAccessToken = (userId: string, role: Role) =>
  jwt.sign({ role, type: "access" }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });
const signRefreshToken = (userId: string) =>
  jwt.sign({ type: "refresh" }, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  });
const tokenExpiry = (token: string) => {
  const payload = jwt.decode(token) as jwt.JwtPayload;
  if (!payload.exp) throw new Error("Token không có hạn dùng");
  return new Date(payload.exp * 1000);
};

async function issueTokens(userId: string, role: Role) {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId);
  await authRepository.createRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: tokenExpiry(refreshToken),
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    if (await authRepository.findUserByEmail(input.email))
      throw new AppError(409, "EMAIL_EXISTS", "Email đã được sử dụng");
    const user = await authRepository.createCustomer({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
      fullName: input.fullName,
      phone: input.phone,
      role: Role.CUSTOMER,
      customerProfile: { create: {} },
    });
    return {
      user: publicUser(user),
      ...(await issueTokens(user.id, user.role)),
    };
  },
  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Email hoặc mật khẩu không đúng",
      );
    if (user.status !== UserStatus.ACTIVE)
      throw new AppError(
        403,
        "ACCOUNT_DISABLED",
        "Tài khoản hiện không hoạt động",
      );
    return {
      user: publicUser(user),
      ...(await issueTokens(user.id, user.role)),
    };
  },
  async googleLogin(credential: string) {
    if (!env.GOOGLE_CLIENT_ID)
      throw new AppError(
        503,
        "GOOGLE_LOGIN_NOT_CONFIGURED",
        "Đăng nhập Google chưa được cấu hình",
      );
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(
        401,
        "INVALID_GOOGLE_TOKEN",
        "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn",
      );
    }
    if (!payload?.sub || !payload.email || !payload.email_verified)
      throw new AppError(
        401,
        "UNVERIFIED_GOOGLE_ACCOUNT",
        "Tài khoản Google chưa xác minh email",
      );
    const email = payload.email.toLowerCase();
    const googleSub = payload.sub;
    const fullName = payload.name?.trim() || email.split("@")[0]!;
    let user = await authRepository.findUserByGoogleSub(googleSub);
    if (!user) {
      const existing = await authRepository.findUserByEmail(email);
      if (existing)
        user = await authRepository.linkGoogleAccount(
          existing.id,
          googleSub,
          payload.picture,
        );
      else {
        user = await authRepository.createCustomer({
          email,
          passwordHash: await bcrypt.hash(
            createOpaqueToken(),
            env.BCRYPT_ROUNDS,
          ),
          googleSub,
          fullName,
          avatarUrl: payload.picture,
          emailVerifiedAt: new Date(),
          role: Role.CUSTOMER,
          customerProfile: { create: {} },
        });
      }
    }
    if (user.status !== UserStatus.ACTIVE)
      throw new AppError(
        403,
        "ACCOUNT_DISABLED",
        "Tài khoản hiện không hoạt động",
      );
    return {
      user: publicUser(user),
      ...(await issueTokens(user.id, user.role)),
    };
  },
  async refresh(refreshToken: string) {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET,
      ) as jwt.JwtPayload;
    } catch {
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token không hợp lệ hoặc đã hết hạn",
      );
    }
    if (payload.type !== "refresh" || !payload.sub)
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token không hợp lệ",
      );
    const stored = await authRepository.findRefreshToken(
      hashToken(refreshToken),
    );
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt <= new Date() ||
      stored.user.status !== UserStatus.ACTIVE
    )
      throw new AppError(
        401,
        "REFRESH_TOKEN_REVOKED",
        "Phiên đăng nhập đã hết hiệu lực",
      );
    await authRepository.revokeRefreshToken(stored.id);
    return issueTokens(stored.userId, stored.user.role);
  },
  async logout(refreshToken: string) {
    const stored = await authRepository.findRefreshToken(
      hashToken(refreshToken),
    );
    if (stored && !stored.revokedAt)
      await authRepository.revokeRefreshToken(stored.id);
  },
  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return null;
    const token = createOpaqueToken();
    await authRepository.createPasswordReset({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    return token;
  },
  async resetPassword(token: string, newPassword: string) {
    const stored = await authRepository.findPasswordReset(hashToken(token));
    if (!stored || stored.usedAt || stored.expiresAt <= new Date())
      throw new AppError(
        400,
        "INVALID_RESET_TOKEN",
        "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      );
    await authRepository.consumePasswordReset(
      stored.id,
      stored.userId,
      await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS),
    );
  },
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash)))
      throw new AppError(400, "WRONG_PASSWORD", "Mật khẩu hiện tại không đúng");
    await authRepository.updatePassword(
      userId,
      await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS),
    );
  },
  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user)
      throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng");
    return publicUser(user);
  },
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await authRepository.findUserById(userId);
    if (!user)
      throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng");
    const scoped: UpdateProfileInput = {
      fullName: input.fullName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    };
    if (user.customerProfile) scoped.dateOfBirth = input.dateOfBirth;
    if (user.staffProfile) {
      scoped.bio = input.bio;
      scoped.specialties = input.specialties;
      scoped.yearsOfExperience = input.yearsOfExperience;
    }
    return publicUser(await authRepository.updateProfile(userId, scoped));
  },
};
