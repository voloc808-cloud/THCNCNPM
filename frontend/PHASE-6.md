# Frontend – Giai đoạn 6: Customer Portal

## Cấu trúc

```text
features/customer/
|-- customer-layout/       # Sidebar và nested router outlet
|-- dashboard/             # Tổng quan khách hàng
|-- booking/               # Wizard đặt lịch 4 bước
|-- appointments/          # Lịch sử, hủy và đánh giá
|-- profile/               # Hồ sơ và đổi mật khẩu
|-- models/                # Kiểu dữ liệu API
|-- services/              # CustomerApiService
`-- customer.routes.ts
```

## Luồng đặt lịch

1. Tải dịch vụ đang hoạt động và cho phép chọn nhiều dịch vụ.
2. Chọn một thợ hoặc “Bất kỳ thợ nào”.
3. Chọn ngày trong 30 ngày tới và lấy slot thật từ `/api/v1/availability`.
4. Xem tổng thời lượng/giá, thêm ghi chú và gọi `POST /api/v1/appointments`.

Khi slot vừa bị người khác đặt, backend trả conflict; wizard quay lại bước chọn giờ và tự tải lại availability.

## Lịch hẹn

- Lọc theo trạng thái và phân trang.
- Hiển thị dịch vụ, thợ, thời gian, giá và mã lịch.
- Chỉ hiện nút hủy khi lịch còn PENDING/CONFIRMED và cách giờ hẹn ít nhất hai giờ.
- Lịch COMPLETED chưa review sẽ hiện form đánh giá 1–5 sao.

## Hồ sơ

Khách có thể cập nhật họ tên, điện thoại, ngày sinh, avatar URL và đổi mật khẩu. Sau khi đổi mật khẩu, frontend xóa phiên hiện tại vì backend đã thu hồi toàn bộ refresh token.

## Route

- `/customer`
- `/customer/dat-lich`
- `/customer/lich-hen`
- `/customer/ho-so`

Toàn bộ route được bảo vệ bởi `authGuard` và `roleGuard(['CUSTOMER'])`.