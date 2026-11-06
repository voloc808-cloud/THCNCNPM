import bcrypt from "bcrypt";
import type { Prisma } from "../../../generated/prisma/client.js";
import { UserStatus } from "../../../generated/prisma/enums.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../common/errors/app-error.js";
import { paginationMeta } from "../../../common/utils/pagination.js";
import { staffRepository } from "../repositories/staff.repository.js";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../schemas/staff.schema.js";
export const staffService = {
  async list(
    query: {
      page: number;
      limit: number;
      search?: string;
      isBookable?: boolean;
      status?: UserStatus;
    },
    publicOnly = false,
  ) {
    const where: Prisma.StaffProfileWhereInput = {
      ...(publicOnly
        ? { isBookable: true, user: { status: UserStatus.ACTIVE } }
        : {
            ...(query.isBookable !== undefined
              ? { isBookable: query.isBookable }
              : {}),
            ...(query.status ? { user: { status: query.status } } : {}),
          }),
      ...(query.search
        ? {
            OR: [
              { user: { fullName: { contains: query.search } } },
              { specialties: { contains: query.search } },
              { user: { email: { contains: query.search } } },
            ],
          }
        : {}),
    };
    const [items, total] = await staffRepository.list(
      where,
      (query.page - 1) * query.limit,
      query.limit,
    );
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },
  async detail(id: string, publicOnly = false) {
    const staff = await staffRepository.findById(id);
    if (
      !staff ||
      (publicOnly &&
        (!staff.isBookable || staff.user.status !== UserStatus.ACTIVE))
    )
      throw new AppError(404, "STAFF_NOT_FOUND", "Không tìm thấy nhân viên");
    return staff;
  },
  async create(input: CreateStaffInput) {
    const user = await staffRepository.create({
      ...input,
      passwordHash: await bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  },
  async update(id: string, input: UpdateStaffInput) {
    await this.detail(id);
    const {
      email,
      password,
      fullName,
      phone,
      avatarUrl,
      status,
      bio,
      specialties,
      yearsOfExperience,
      isBookable,
      serviceIds,
    } = input;
    const user: Prisma.UserUpdateInput = {
      email,
      fullName,
      phone,
      avatarUrl,
      status,
      ...(password
        ? { passwordHash: await bcrypt.hash(password, env.BCRYPT_ROUNDS) }
        : {}),
    };
    const result = await staffRepository.update(id, {
      user,
      profile: { bio, specialties, yearsOfExperience, isBookable },
      serviceIds,
    });
    if (!result)
      throw new AppError(404, "STAFF_NOT_FOUND", "Không tìm thấy nhân viên");
    return result;
  },
  async remove(id: string) {
    await this.detail(id);
    await staffRepository.remove(id);
  },
};
