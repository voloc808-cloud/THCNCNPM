import bcrypt from "bcrypt";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { UserStatus } from "../../../generated/prisma/enums.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../common/errors/app-error.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { authRepository } from "../../auth/repositories/auth.repository.js";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../schemas/customer.schema.js";
export const customerService = {
  async list(query: {
    page: number;
    limit: number;
    search?: string;
    status?: UserStatus;
  }) {
    const where: Prisma.CustomerProfileWhereInput = {
      ...(query.status ? { user: { status: query.status } } : {}),
      ...(query.search
        ? {
            OR: [
              { user: { fullName: { contains: query.search } } },
              { user: { email: { contains: query.search } } },
              { user: { phone: { contains: query.search } } },
            ],
          }
        : {}),
    };
    const [items, total] = await customerRepository.list(
      where,
      (query.page - 1) * query.limit,
      query.limit,
    );
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async create(input: CreateCustomerInput) {
    const user = await customerRepository.create({
      ...input,
      passwordHash: await bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  },
  async detail(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer)
      throw new AppError(
        404,
        "CUSTOMER_NOT_FOUND",
        "Không tìm thấy khách hàng",
      );
    return customer;
  },
  async update(id: string, input: UpdateCustomerInput) {
    await this.detail(id);
    const {
      fullName,
      phone,
      avatarUrl,
      status,
      dateOfBirth,
      notes,
      loyaltyPoint,
    } = input;
    const result = await customerRepository.update(id, {
      user: { fullName, phone, avatarUrl, status },
      profile: { dateOfBirth, notes, loyaltyPoint },
    });
    if (!result)
      throw new AppError(
        404,
        "CUSTOMER_NOT_FOUND",
        "Không tìm thấy khách hàng",
      );
    return result;
  },
  async remove(id: string) {
    await this.detail(id);
    await customerRepository.remove(id);
  },
  async setPassword(id: string, newPassword: string) {
    const customer = await this.detail(id);
    await authRepository.updatePassword(
      customer.user.id,
      await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS),
    );
  },
};
