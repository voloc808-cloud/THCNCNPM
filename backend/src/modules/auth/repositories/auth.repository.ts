import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/prisma.js";
export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true, staffProfile: true },
    }),
  findUserByGoogleSub: (googleSub: string) =>
    prisma.user.findUnique({
      where: { googleSub },
      include: { customerProfile: true, staffProfile: true },
    }),
  findUserById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true, staffProfile: true },
    }),
  createCustomer: (data: Prisma.UserCreateInput) =>
    prisma.user.create({
      data,
      include: { customerProfile: true, staffProfile: true },
    }),
  linkGoogleAccount: (id: string, googleSub: string, avatarUrl?: string) =>
    prisma.user.update({
      where: { id },
      data: {
        googleSub,
        emailVerifiedAt: new Date(),
        avatarUrl: avatarUrl || undefined,
      },
      include: { customerProfile: true, staffProfile: true },
    }),
  createRefreshToken: (data: Prisma.RefreshTokenUncheckedCreateInput) =>
    prisma.refreshToken.create({ data }),
  findRefreshToken: (tokenHash: string) =>
    prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),
  revokeRefreshToken: (id: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    }),
  revokeAllUserTokens: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  createPasswordReset: (data: Prisma.PasswordResetTokenUncheckedCreateInput) =>
    prisma.passwordResetToken.create({ data }),
  findPasswordReset: (tokenHash: string) =>
    prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),
  consumePasswordReset: (id: string, userId: string, passwordHash: string) =>
    prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]),
  updatePassword: (userId: string, passwordHash: string) =>
    prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]),
  updateProfile: (
    userId: string,
    data: {
      fullName?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      dateOfBirth?: Date | null;
      bio?: string | null;
      specialties?: string | null;
      yearsOfExperience?: number;
    },
  ) =>
    prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        customerProfile:
          data.dateOfBirth !== undefined
            ? { update: { dateOfBirth: data.dateOfBirth } }
            : undefined,
        staffProfile:
          data.bio !== undefined ||
          data.specialties !== undefined ||
          data.yearsOfExperience !== undefined
            ? {
                update: {
                  bio: data.bio,
                  specialties: data.specialties,
                  yearsOfExperience: data.yearsOfExperience,
                },
              }
            : undefined,
      },
      include: { customerProfile: true, staffProfile: true },
    }),
};
