# Cấu trúc frontend

Frontend được chia theo khu vực chức năng:

- `core/`: thành phần dùng một lần toàn ứng dụng như xác thực, guard, interceptor, layout và API client.
- `shared/`: component, directive, pipe, model và tiện ích dùng lại ở nhiều feature.
- `features/public/`: trang chủ, giới thiệu và liên hệ dành cho mọi người.
- `features/products/`: danh sách/chi tiết sản phẩm chăm sóc tóc nếu salon kinh doanh sản phẩm.
- `features/services/`: danh sách và chi tiết dịch vụ cắt tóc.
- `features/booking/`: luồng chọn dịch vụ, thợ, ngày, giờ và xác nhận lịch.
- `features/customer/`: hồ sơ, lịch sử đặt lịch và đánh giá của khách hàng.
- `features/staff/`: lịch làm việc, lịch hẹn và ngày nghỉ của thợ.
- `features/admin/`: dashboard và các màn hình quản trị.

Mỗi feature lớn tiếp tục chia thành `pages`, `components`, `services` và `models` khi được triển khai. Route của feature sẽ được lazy-load từ `app.routes.ts`.
