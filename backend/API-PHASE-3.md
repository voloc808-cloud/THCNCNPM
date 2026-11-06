# API Giai đoạn 3

Base URL: `http://localhost:3000/api/v1`. Swagger UI: `http://localhost:3000/api-docs`.

## Khung giờ trống

```http
GET /availability?date=2026-10-10&serviceIds=id1,id2&staffId=optional
```

Slot được tính từ ca làm, tổng thời lượng dịch vụ, lịch đang `PENDING/CONFIRMED` và ngày nghỉ đã duyệt. Mỗi slot cách nhau theo `BOOKING_INTERVAL_MINUTES` (mặc định 30 phút) và trả về danh sách thợ còn trống. Không nhận ngày quá khứ hoặc quá `MAX_BOOKING_DAYS_AHEAD`.

## Khách hàng

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/appointments` | Lịch sử lịch hẹn của tôi |
| POST | `/appointments` | Đặt lịch, bỏ `staffId` để tự chọn thợ |
| GET | `/appointments/:id` | Chi tiết lịch của tôi |
| PATCH | `/appointments/:id/cancel` | Hủy trước giờ hẹn tối thiểu 2 giờ |
| POST | `/reviews/appointments/:id` | Đánh giá lịch đã hoàn thành |

Body đặt lịch:

```json
{
  "serviceIds": ["service-id-1", "service-id-2"],
  "staffId": null,
  "startAt": "2026-10-10T09:00:00+07:00",
  "customerNote": "Cắt ngắn hai bên"
}
```

## Nhân viên

- `GET /staff/me/schedule/shifts`
- `GET/POST /staff/me/schedule/days-off`
- `DELETE /staff/me/schedule/days-off/:id` – chỉ yêu cầu đang chờ duyệt.
- `GET /staff/me/appointments`
- `GET /staff/me/appointments/:id`
- `PATCH /staff/me/appointments/:id/status`

Nhân viên được chuyển `PENDING → CONFIRMED`, sau đó `CONFIRMED → COMPLETED/NO_SHOW`.

## Quản trị

- CRUD ca: `/admin/schedule/staff/:staffId/shifts`
- Danh sách/duyệt ngày nghỉ: `/admin/schedule/days-off`
- Danh sách và đặt lịch tại quầy: `/admin/appointments`
- Trạng thái: `PATCH /admin/appointments/:id/status`
- Đổi thợ/giờ: `PATCH /admin/appointments/:id/reschedule`

## Chống trùng lịch

Khi lưu hoặc đổi lịch, backend mở transaction `SERIALIZABLE`, khóa hàng thợ bằng `SELECT ... FOR UPDATE`, rồi kiểm tra lại ca làm, chuyên môn, ngày nghỉ và mọi lịch giao nhau trước khi insert/update. Vì mọi yêu cầu cho cùng thợ phải lấy cùng khóa, hai request đồng thời không thể tạo hai lịch chồng nhau.

## Email và cron

- Email xác nhận được gửi sau khi transaction đặt lịch thành công.
- Cron chạy mỗi 15 phút, tìm lịch cách thời điểm hiện tại khoảng 24 giờ và chỉ đánh dấu `reminderSentAt` sau khi gửi thành công.
- Mailpit mặc định: SMTP `localhost:1025`, giao diện `http://localhost:8025`.

Các endpoint xác thực và CRUD Giai đoạn 2 vẫn giữ nguyên; xem Swagger để thử trực tiếp.