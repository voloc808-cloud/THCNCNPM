# Giai đoạn 10 — Báo cáo, thống kê và hoàn thiện

## Backend analytics

- API `GET /api/v1/admin/analytics/summary`.
- API `GET /api/v1/admin/analytics/export.csv`.
- Lọc theo `dateFrom` và `dateTo`; mặc định 30 ngày.
- Chỉ vai trò ADMIN được truy cập.
- Doanh thu chỉ ghi nhận lịch hẹn và đơn hàng `COMPLETED`.

## KPI

- Tổng doanh thu.
- Doanh thu dịch vụ và sản phẩm.
- Lịch hẹn và đơn hàng hoàn thành.
- Khách hàng mới.
- Tỷ lệ lịch hủy hoặc khách vắng.

## Báo cáo

- Doanh thu theo ngày.
- Trạng thái lịch hẹn.
- Dịch vụ nổi bật.
- Sản phẩm bán chạy.
- Hiệu suất nhân viên.
- Cảnh báo sản phẩm tồn kho từ 5 trở xuống.
- Xuất CSV UTF-8 có BOM để mở đúng tiếng Việt trong Excel.

## Frontend

- Dashboard `/admin` dùng KPI và doanh thu 30 ngày thật.
- Báo cáo `/admin/bao-cao` có bộ lọc ngày, biểu đồ responsive và bảng xếp hạng.
- Loading, error và empty state cho báo cáo.

## Kiểm tra

- Backend TypeScript build: thành công.
- Angular production build: thành công.
- Admin summary: HTTP 200.
- CSV export: HTTP 200, `text/csv; charset=utf-8`.
- Staff truy cập analytics: HTTP 403.
- Customer truy cập analytics: HTTP 403.

Nếu chưa có giao dịch hoàn thành, doanh thu hiển thị 0 là đúng nghiệp vụ.