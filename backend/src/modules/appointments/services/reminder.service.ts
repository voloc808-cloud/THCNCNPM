import cron from "node-cron";
import { env } from "../../../config/env.js";
import { emailService } from "../../../common/services/email.service.js";
import { appointmentRepository } from "../repositories/appointment.repository.js";
export const sendDueReminders = async () => {
  const target = Date.now() + 24 * 60 * 60 * 1000;
  const items = await appointmentRepository.dueReminders(
    new Date(target - 8 * 60 * 1000),
    new Date(target + 8 * 60 * 1000),
  );
  for (const item of items) {
    const sent = await emailService.sendBookingReminder({
      email: item.customer.user.email,
      fullName: item.customer.user.fullName,
      code: item.code,
      startAt: item.startAt,
      staffName: item.staff.user.fullName,
      services: item.services.map((service) => service.serviceName),
      totalPrice: Number(item.totalPrice),
    });
    if (sent) await appointmentRepository.markReminderSent(item.id);
  }
  return items.length;
};
export const startReminderJob = () =>
  cron.schedule(
    "*/15 * * * *",
    () => {
      void sendDueReminders().catch((error) =>
        console.error("Cron nhắc lịch thất bại:", error),
      );
    },
    { timezone: env.APP_TIMEZONE },
  );
