import { env } from "../../config/env.js";
import { mailer } from "../../config/mailer.js";
import { formatVietnamDateTime } from "../utils/date-time.js";
type AppointmentMail = {
  email: string;
  fullName: string;
  code: string;
  startAt: Date;
  staffName: string;
  services: string[];
  totalPrice: number;
};
const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
const send = async (to: string, subject: string, html: string) => {
  try {
    await mailer.sendMail({ from: env.SMTP_FROM, to, subject, html });
    return true;
  } catch (error) {
    console.error("Không thể gửi email:", error);
    return false;
  }
};
export const emailService = {
  sendBookingConfirmation: (data: AppointmentMail) =>
    send(
      data.email,
      `Xác nhận lịch hẹn ${data.code}`,
      `<h2>Xin chào ${data.fullName}</h2><p>Lịch hẹn <strong>${data.code}</strong> đã được ghi nhận.</p><p>Thời gian: ${formatVietnamDateTime(data.startAt)}</p><p>Thợ: ${data.staffName}</p><p>Dịch vụ: ${data.services.join(", ")}</p><p>Tổng tiền: ${money(data.totalPrice)}</p>`,
    ),
  sendBookingReminder: (data: AppointmentMail) =>
    send(
      data.email,
      `Nhắc lịch hẹn ${data.code}`,
      `<h2>Nhắc lịch Royal Barber</h2><p>Xin chào ${data.fullName}, bạn có lịch vào ${formatVietnamDateTime(data.startAt)} với ${data.staffName}.</p><p>Mã lịch: <strong>${data.code}</strong></p>`,
    ),
};
