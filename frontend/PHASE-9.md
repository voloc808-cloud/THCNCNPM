# Giai đoạn 9 — Sản phẩm và bán hàng

## Database

Đã đồng bộ bằng `prisma db push`:

- `product_categories`
- `products`
- `orders`
- `order_items`
- Enum `OrderStatus`

## Backend

- Catalog danh mục/sản phẩm công khai, tìm kiếm và phân trang.
- CRUD danh mục và sản phẩm dành cho Admin.
- Quản lý giá, tồn kho, ảnh, trạng thái và thứ tự hiển thị.
- Upload JPG/PNG/WebP cho sản phẩm.
- Tạo đơn trong transaction, kiểm tra và trừ tồn kho an toàn.
- Miễn phí giao hàng từ 500.000đ; phí mặc định 30.000đ.
- Khách xem lịch sử và hủy đơn đang chờ; tồn kho được hoàn lại.
- Admin chuyển trạng thái đơn theo quy trình.

## Frontend

- `/san-pham` — catalog thật từ MySQL.
- `/san-pham/:slug` — chi tiết sản phẩm.
- `/gio-hang` — giỏ hàng localStorage.
- `/thanh-toan` — checkout khách hàng.
- `/don-hang` — theo dõi và hủy đơn.
- `/admin/san-pham` — CRUD danh mục/sản phẩm/tồn kho/upload.
- `/admin/don-hang` — quản lý trạng thái đơn.

## Seed và kiểm tra

- Seed riêng: `npm run db:seed:commerce -w @barber/api`.
- 3 danh mục và 4 sản phẩm mẫu.
- Backend TypeScript build: thành công.
- Angular production build: thành công.
- Smoke test catalog, Admin products/orders và chu kỳ tạo–hủy đơn: thành công.
- Đơn smoke-test đã được xóa sau kiểm tra.