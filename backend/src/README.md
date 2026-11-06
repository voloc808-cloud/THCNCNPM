# Cấu trúc backend

- `config/`: đọc và kiểm tra cấu hình môi trường.
- `generated/`: Prisma Client sinh tự động, không sửa thủ công.
- `common/`: middleware, lỗi, tiện ích và kiểu dữ liệu dùng chung.
- `modules/`: mã nguồn chia theo nghiệp vụ.

Mỗi module nghiệp vụ dùng cấu trúc `route → controller → service → repository`; schema Zod của request nằm trong thư mục `schemas` của module.
