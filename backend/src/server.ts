import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { startReminderJob } from "./modules/appointments/services/reminder.service.js";
const reminderJob = startReminderJob();
const server = createApp().listen(env.PORT, () =>
  console.log(
    `API đang chạy tại http://localhost:${env.PORT}${env.API_PREFIX}`,
  ),
);
const shutdown = (signal: string) => {
  console.log(`Nhận ${signal}, đang dừng máy chủ...`);
  reminderJob.stop();
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
