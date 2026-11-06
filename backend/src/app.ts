import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerDocument } from "./config/swagger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./common/middleware/error.middleware.js";
import { authRouter } from "./modules/auth/routes/auth.routes.js";
import { adminCustomerRouter } from "./modules/customers/routes/customer.routes.js";
import {
  adminServiceRouter,
  publicServiceRouter,
} from "./modules/services/routes/service.routes.js";
import {
  adminStaffRouter,
  publicStaffRouter,
} from "./modules/staff/routes/staff.routes.js";
import { uploadRouter } from "./modules/admin/routes/upload.routes.js";
import {
  availabilityRouter,
  customerAppointmentRouter,
  staffAppointmentRouter,
  adminAppointmentRouter,
} from "./modules/appointments/routes/appointment.routes.js";
import {
  staffScheduleRouter,
  adminScheduleRouter,
} from "./modules/staff/routes/schedule.routes.js";
import { reviewRouter } from "./modules/reviews/routes/review.routes.js";
import {
  adminProductRouter,
  publicProductRouter,
} from "./modules/products/routes/product.routes.js";
import {
  adminOrderRouter,
  customerOrderRouter,
} from "./modules/orders/routes/order.routes.js";
import { analyticsRouter } from "./modules/analytics/routes/analytics.routes.js";
import {
  adminLookbookRouter,
  publicLookbookRouter,
} from "./modules/lookbook/routes/lookbook.routes.js";

export const createApp = () => {
  const app = express();
  const uploadsDirectory = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDirectory, { recursive: true });
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    "/uploads",
    express.static(uploadsDirectory, { dotfiles: "deny", maxAge: "7d" }),
  );
  app.get(`${env.API_PREFIX}/health`, (_request, response) =>
    response.json({
      success: true,
      message: "API đang hoạt động",
      timestamp: new Date().toISOString(),
    }),
  );
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(`${env.API_PREFIX}/services`, publicServiceRouter);
  app.use(`${env.API_PREFIX}/lookbook`, publicLookbookRouter);
  app.use(`${env.API_PREFIX}/staff`, publicStaffRouter);
  app.use(`${env.API_PREFIX}/admin/services`, adminServiceRouter);
  app.use(`${env.API_PREFIX}/admin/lookbook`, adminLookbookRouter);
  app.use(`${env.API_PREFIX}/admin/staff`, adminStaffRouter);
  app.use(`${env.API_PREFIX}/admin/customers`, adminCustomerRouter);
  app.use(`${env.API_PREFIX}/admin/uploads`, uploadRouter);
  app.use(`${env.API_PREFIX}/availability`, availabilityRouter);
  app.use(`${env.API_PREFIX}/appointments`, customerAppointmentRouter);
  app.use(`${env.API_PREFIX}/staff/me/schedule`, staffScheduleRouter);
  app.use(`${env.API_PREFIX}/staff/me/appointments`, staffAppointmentRouter);
  app.use(`${env.API_PREFIX}/admin/schedule`, adminScheduleRouter);
  app.use(`${env.API_PREFIX}/admin/appointments`, adminAppointmentRouter);
  app.use(`${env.API_PREFIX}/products`, publicProductRouter);
  app.use(`${env.API_PREFIX}/orders`, customerOrderRouter);
  app.use(`${env.API_PREFIX}/admin/products`, adminProductRouter);
  app.use(`${env.API_PREFIX}/admin/orders`, adminOrderRouter);
  app.use(`${env.API_PREFIX}/admin/analytics`, analyticsRouter);
  app.use(`${env.API_PREFIX}/reviews`, reviewRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
