import { AppError } from "../../../common/errors/app-error.js";
import { reviewRepository } from "../repositories/review.repository.js";
export const reviewService = {
  async create(
    userId: string,
    appointmentId: string,
    input: { rating: number; comment?: string },
  ) {
    const customer = await reviewRepository.customerByUserId(userId);
    if (!customer)
      throw new AppError(
        404,
        "CUSTOMER_PROFILE_NOT_FOUND",
        "Tài khoản chưa có hồ sơ khách hàng",
      );
    const result = await reviewRepository.createForAppointment(
      appointmentId,
      customer.id,
      input.rating,
      input.comment,
    );
    if (result.kind === "not_found")
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Không tìm thấy lịch hẹn",
      );
    if (result.kind === "forbidden")
      throw new AppError(
        403,
        "FORBIDDEN",
        "Bạn không thể đánh giá lịch của người khác",
      );
    if (result.kind === "not_completed")
      throw new AppError(
        409,
        "APPOINTMENT_NOT_COMPLETED",
        "Chỉ được đánh giá sau khi lịch hoàn thành",
      );
    if (result.kind === "reviewed")
      throw new AppError(409, "ALREADY_REVIEWED", "Lịch hẹn đã được đánh giá");
    return result.review;
  },
  list: (staffId?: string) => reviewRepository.listVisible(staffId),
  listForManagement: (staffUserId?: string) => reviewRepository.listForManagement(staffUserId),
};
