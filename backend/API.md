# API Giai đoạn 2

Base URL: `http://localhost:3000/api/v1`. Swagger UI: `http://localhost:3000/api-docs`.

## Xác thực và hồ sơ

| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/auth/register` | Công khai |
| POST | `/auth/login` | Công khai |
| POST | `/auth/refresh` | Công khai |
| POST | `/auth/logout` | Công khai |
| POST | `/auth/forgot-password` | Công khai |
| POST | `/auth/reset-password` | Công khai |
| POST | `/auth/change-password` | Đã đăng nhập |
| GET/PATCH | `/auth/me` | Đã đăng nhập |

Các API có bảo vệ nhận access token qua header `Authorization: Bearer <token>`. Refresh token được xoay vòng: token cũ bị thu hồi ngay sau khi đổi thành công.

## Danh mục công khai

- `GET /services`, `GET /services/:id`
- `GET /staff`, `GET /staff/:id`

Danh sách hỗ trợ `page`, `limit`, `search`; các bộ lọc bổ sung được mô tả trong Swagger.

## Quản trị

Tất cả endpoint dưới đây yêu cầu vai trò `ADMIN`:

- CRUD dịch vụ: `/admin/services`
- CRUD nhân viên: `/admin/staff`
- CRUD khách hàng: `/admin/customers`
- Upload ảnh: `POST /admin/uploads/images`, multipart field `image`, hỗ trợ JPG/PNG/WebP tối đa 5 MB.

API xóa trả về HTTP `204`. Nếu bản ghi đã được lịch hẹn tham chiếu, API từ chối xóa để bảo toàn lịch sử; quản trị viên nên chuyển `status` hoặc `isActive` thay vì xóa.

Email quên mật khẩu sẽ được nối với Nodemailer ở Giai đoạn 3. Trong môi trường `development`, response quên mật khẩu trả thêm `developmentResetToken` để kiểm thử; production không bao giờ trả token này.