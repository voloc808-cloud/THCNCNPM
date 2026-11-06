const ok = { description: "Thành công" };
const secured = { security: [{ bearerAuth: [] }] };
export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Royal Barber API",
    version: "1.0.0",
    description: "API xác thực, quản lý salon, ca làm việc và đặt lịch.",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Booking: {
        type: "object",
        required: ["serviceIds", "startAt"],
        properties: {
          serviceIds: { type: "array", items: { type: "string" } },
          staffId: {
            type: "string",
            nullable: true,
            description: "Bỏ trống để hệ thống tự chọn thợ",
          },
          startAt: { type: "string", format: "date-time" },
          customerNote: { type: "string" },
        },
      },
      Status: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký khách hàng",
        responses: { "201": ok },
      },
    },
    "/auth/login": {
      post: { tags: ["Auth"], summary: "Đăng nhập", responses: { "200": ok } },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Xoay vòng refresh token",
        responses: { "200": ok },
      },
    },
    "/auth/me": {
      get: {
        ...secured,
        tags: ["Auth"],
        summary: "Hồ sơ của tôi",
        responses: { "200": ok },
      },
      patch: {
        ...secured,
        tags: ["Auth"],
        summary: "Cập nhật hồ sơ",
        responses: { "200": ok },
      },
    },
    "/services": {
      get: {
        tags: ["Public"],
        summary: "Danh sách dịch vụ",
        responses: { "200": ok },
      },
    },
    "/staff": {
      get: {
        tags: ["Public"],
        summary: "Danh sách thợ",
        responses: { "200": ok },
      },
    },
    "/availability": {
      get: {
        tags: ["Booking"],
        summary: "Tính slot trống theo ngày, dịch vụ và thợ",
        parameters: [
          {
            in: "query",
            name: "date",
            required: true,
            schema: { type: "string", format: "date" },
          },
          {
            in: "query",
            name: "serviceIds",
            required: true,
            schema: { type: "string" },
            description: "Các ID cách nhau bằng dấu phẩy",
          },
          { in: "query", name: "staffId", schema: { type: "string" } },
        ],
        responses: { "200": ok },
      },
    },
    "/appointments": {
      get: {
        ...secured,
        tags: ["Customer appointments"],
        summary: "Lịch hẹn của khách",
        responses: { "200": ok },
      },
      post: {
        ...secured,
        tags: ["Customer appointments"],
        summary: "Đặt lịch",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Booking" },
            },
          },
        },
        responses: { "201": ok },
      },
    },
    "/appointments/{id}/cancel": {
      patch: {
        ...secured,
        tags: ["Customer appointments"],
        summary: "Hủy trước giờ hẹn tối thiểu 2 giờ",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": ok },
      },
    },
    "/staff/me/schedule/shifts": {
      get: {
        ...secured,
        tags: ["Staff"],
        summary: "Ca làm việc của tôi",
        responses: { "200": ok },
      },
    },
    "/staff/me/schedule/days-off": {
      get: {
        ...secured,
        tags: ["Staff"],
        summary: "Ngày nghỉ của tôi",
        responses: { "200": ok },
      },
      post: {
        ...secured,
        tags: ["Staff"],
        summary: "Đăng ký ngày nghỉ",
        responses: { "201": ok },
      },
    },
    "/staff/me/appointments": {
      get: {
        ...secured,
        tags: ["Staff"],
        summary: "Lịch hẹn của thợ",
        responses: { "200": ok },
      },
    },
    "/staff/me/appointments/{id}/status": {
      patch: {
        ...secured,
        tags: ["Staff"],
        summary: "Xác nhận/hoàn thành/vắng mặt",
        responses: { "200": ok },
      },
    },
    "/admin/appointments": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Quản lý lịch hẹn",
        responses: { "200": ok },
      },
      post: {
        ...secured,
        tags: ["Admin"],
        summary: "Đặt lịch hộ khách tại quầy",
        responses: { "201": ok },
      },
    },
    "/admin/appointments/{id}/reschedule": {
      patch: {
        ...secured,
        tags: ["Admin"],
        summary: "Đổi thợ hoặc giờ",
        responses: { "200": ok },
      },
    },
    "/admin/schedule/staff/{staffId}/shifts": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Ca của nhân viên",
        responses: { "200": ok },
      },
      post: {
        ...secured,
        tags: ["Admin"],
        summary: "Tạo ca",
        responses: { "201": ok },
      },
    },
    "/admin/schedule/days-off": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Danh sách yêu cầu nghỉ",
        responses: { "200": ok },
      },
    },
    "/reviews/appointments/{id}": {
      post: {
        ...secured,
        tags: ["Reviews"],
        summary: "Đánh giá lịch đã hoàn thành",
        responses: { "201": ok },
      },
    },
    "/admin/services": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Quản lý dịch vụ",
        responses: { "200": ok },
      },
    },
    "/admin/staff": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Quản lý nhân viên",
        responses: { "200": ok },
      },
    },
    "/admin/customers": {
      get: {
        ...secured,
        tags: ["Admin"],
        summary: "Quản lý khách hàng",
        responses: { "200": ok },
      },
    },
  },
};
