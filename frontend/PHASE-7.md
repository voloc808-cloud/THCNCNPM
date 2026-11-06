# Giai đoạn 7 — Admin Portal

## Đã hoàn thành

- Admin layout và nested lazy routes riêng.
- Dashboard tổng hợp số lượng dịch vụ, nhân viên, khách hàng và lịch hẹn.
- CRUD dịch vụ: tìm kiếm, phân trang, thêm, sửa, xóa, giá, thời lượng, trạng thái.
- CRUD nhân viên: tài khoản, hồ sơ, chuyên môn, kinh nghiệm, trạng thái nhận lịch.
- CRUD khách hàng: tài khoản, hồ sơ, điểm thành viên, trạng thái, ghi chú.
- Quản lý lịch hẹn: lọc trạng thái, cập nhật trạng thái, đổi thời gian.
- Quản lý ca làm việc: chọn nhân viên, thêm, bật/tắt và xóa ca.
- Duyệt hoặc từ chối yêu cầu nghỉ.
- Responsive layout cho desktop và mobile.

## Route

- `/admin`
- `/admin/dich-vu`
- `/admin/nhan-vien`
- `/admin/khach-hang`
- `/admin/lich-hen`
- `/admin/lich-lam-viec`

## Sửa lỗi backend liên quan

Middleware Zod đã được cập nhật để tương thích Express 5: query được parse và coerce đúng trước khi truyền vào Prisma.

## Kiểm tra

- Angular production build: thành công.
- Backend TypeScript build: thành công.
- Admin login và toàn bộ endpoint danh sách: thành công.