# Royal Barber – Hệ thống quản lý và đặt lịch

Monorepo gồm Angular standalone frontend và Express/TypeScript + Prisma/MySQL backend. Dự án đã hoàn thành **Giai đoạn 6**: backend nghiệp vụ, trang chủ 3D, xác thực và toàn bộ luồng đặt lịch/khu vực khách hàng.

## Yêu cầu môi trường

- Node.js `>=22.22.3` (máy hiện tại dùng 24.14.0)
- npm 11+
- Docker Desktop (khuyến nghị) hoặc MySQL 8.4+

Angular 21 được dùng vì Angular CLI 22.2.2 yêu cầu Node 24.15.0 trở lên. Sau khi nâng Node có thể chạy `ng update` để lên Angular 22.

## Cài đặt và chạy

```powershell
npm install
Copy-Item .env.example backend/.env
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- Frontend: http://localhost:4200
- Health API: http://localhost:3000/api/v1/health
- Mailpit: http://localhost:8025
- Swagger API: http://localhost:3000/api-docs

Tài khoản seed dùng chung mật khẩu `Password@123`: `admin@royalbarber.vn`, `minh@royalbarber.vn`, `khoa@royalbarber.vn`, `customer@example.com`.

## Cấu trúc

```text
.
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/config/env.ts
|   |-- src/app.ts
|   `-- src/server.ts
|-- frontend/               # Angular standalone application
|-- docs/erd.md
|-- .env.example
|-- docker-compose.yml
`-- package.json
```

Các lớp `route → controller → service → repository` sẽ được thêm theo từng module ở Giai đoạn 2, tránh tạo file rỗng không có trách nhiệm thực tế.

## Kiểm tra Giai đoạn 1

```powershell
npm run build
npm run db:generate
npm run dev:api
```

Mở endpoint health và chạy `npm run db:studio -w @barber/api` để kiểm tra dữ liệu mẫu. ERD nằm tại [docs/erd.md](docs/erd.md).