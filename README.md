# 💈 Royal Barber – Hệ Thống Quản Lý & Đặt Lịch Hẹn Cắt Tóc

Hệ thống quản lý salon tóc và đặt lịch cắt tóc trực tuyến toàn diện, xây dựng theo kiến trúc **Monorepo** với giao diện hiện đại (hỗ trợ 3D tương tác) và hệ thống API mạnh mẽ, bảo mật.

---

## 📑 Mục lục

1. [Tổng quan công nghệ](#-tổng-quan-công-nghệ)
2. [Các tính năng nổi bật](#-các-tính-năng-nổi-bật)
3. [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
4. [Yêu cầu môi trường](#-yêu-cầu-môi-trường)
5. [Hướng dẫn cài đặt & Chạy dự án](#-hướng-dẫn-cài-đặt--chạy-dự-án)
6. [Danh sách tài khoản kiểm thử](#-danh-sách-tài-khoản-kiểm-thử)
7. [Các đường dẫn & Cổng dịch vụ](#-các-đường-dẫn--cổng-dịch-vụ)
8. [Danh mục lệnh (Scripts Reference)](#-danh-mục-lệnh-scripts-reference)

---

## 🛠 Tổng quan công nghệ

### Frontend
- **Framework:** Angular 21 (Kiến trúc Standalone Components, Signal & RxJS)
- **UI & Đồ họa:** SCSS, Responsive Design, **Three.js** (Mô hình 3D tương tác tại trang chủ), **GSAP** (Hiệu ứng chuyển động mượt mà)
- **State & HTTP:** Angular HttpClient, Interceptors đính kèm JWT tự động

### Backend
- **Nền tảng:** Node.js, Express, TypeScript (kiểu dữ liệu tĩnh nghiêm ngặt)
- **ORM & CSDL:** Prisma ORM, MySQL 8.4
- **Xác thực & Bảo mật:** JWT (Access Token 15m + Refresh Token 7d), Google OAuth 2.0, Bcrypt hash mật khẩu, Helmet, Express Rate Limit
- **Validation:** Zod Schema Validation
- **Upload & Mailer:** Multer (xử lý tệp tin), Nodemailer (tích hợp Mailpit trong môi trường dev)
- **Tài liệu API:** Swagger UI (OpenAPI)

### Hạ tầng hỗ trợ
- **Docker Compose:** Đóng gói sẵn dịch vụ MySQL 8.4 và Mailpit (máy chủ SMTP giả lập)
- **Monorepo:** Quản lý không gian làm việc qua `npm workspaces`

---

## 🌟 Các tính năng nổi bật

- **Trang chủ 3D & Lookbook:** Trải nghiệm không gian salon bằng đồ họa Three.js chân thực, bộ sưu tập mẫu tóc xu hướng (Lookbook).
- **Quy trình đặt lịch trực quan (Booking Flow):** Chọn dịch vụ $\rightarrow$ Chọn thợ theo ý muốn $\rightarrow$ Chọn ngày và khung giờ còn trống (Slot) $\rightarrow$ Xác nhận tức thì.
- **Hệ thống thương mại (E-Commerce):** Danh mục sản phẩm tạo kiểu / chăm sóc tóc, giỏ hàng, đặt mua và theo dõi đơn hàng.
- **Phân quyền người dùng (RBAC):**
  - **Khách hàng (Customer):** Đặt lịch hẹn, quản lý thông tin cá nhân, xem lịch sử đặt chỗ, đánh giá dịch vụ.
  - **Thợ cắt tóc (Staff):** Xem lịch làm việc theo ngày/tuần, quản lý danh sách cuộc hẹn được phân công.
  - **Quản trị viên (Admin):** Bảng thống kê (Analytics), quản lý toàn bộ nhân viên, bảng giá dịch vụ, đơn hàng, khách hàng và upload hình ảnh.
- **Thông báo Email:** Gửi email xác nhận cuộc hẹn, kích hoạt và cấp lại mật khẩu qua máy chủ SMTP.

---

## 📂 Cấu trúc thư mục dự án

```text
DuAnCatToc/
├── backend/                    # Mã nguồn máy chủ API (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Định nghĩa các bảng dữ liệu & quan hệ (ERD)
│   │   ├── migrations/         # Lịch sử phiên bản di chuyển CSDL
│   │   ├── seed.ts             # Dữ liệu mẫu (Tài khoản, Dịch vụ, Thợ...)
│   │   └── seed-commerce.ts    # Dữ liệu mẫu bổ sung cho sản phẩm/đơn hàng
│   ├── src/
│   │   ├── config/             # Cấu hình biến môi trường và kết nối Prisma
│   │   ├── common/             # Thành phần dùng chung (Middleware JWT, Handler lỗi, Utils)
│   │   ├── generated/          # Prisma Client tự động sinh
│   │   └── modules/            # Các module nghiệp vụ (Route → Controller → Service → Repository):
│   │       ├── admin/          # Thống kê, quản lý nâng cao & upload file
│   │       ├── analytics/      # Phân tích dữ liệu, doanh thu salon
│   │       ├── appointments/   # Quản lý đặt chỗ, slot giờ hẹn
│   │       ├── auth/           # Đăng ký, đăng nhập, Google Auth, Reset password
│   │       ├── cart/ & orders/ # Giỏ hàng và quy trình đơn hàng
│   │       ├── customers/      # Hồ sơ khách hàng
│   │       ├── lookbook/       # Bộ sưu tập kiểu tóc
│   │       ├── products/       # Danh mục và kho sản phẩm
│   │       ├── reviews/        # Đánh giá, xếp hạng sao
│   │       ├── services/       # Danh mục các dịch vụ làm tóc
│   │       ├── staff/          # Quản lý thợ cắt tóc và lịch làm
│   │       └── users/          # Quản lý tài khoản hệ thống
│   ├── uploads/                # Thư mục lưu trữ hình ảnh tải lên
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Ứng dụng Giao diện Web (Angular)
│   ├── public/                 # Tài nguyên tĩnh (Logo, 3D Assets, Icons)
│   └── src/
│       ├── app/
│       │   ├── core/           # Dịch vụ cốt lõi (Auth, Guards, HTTP Interceptors, Layouts)
│       │   ├── features/       # Các màn hình theo tính năng người dùng:
│       │   │   ├── admin/      # Quản trị viên (Dashboard, Dịch vụ, Thợ...)
│       │   │   ├── auth/       # Đăng nhập, Đăng ký, Quên mật khẩu
│       │   │   ├── booking/    # Luồng đặt lịch hẹn từng bước
│       │   │   ├── cart/       # Giỏ hàng sản phẩm
│       │   │   ├── customer/   # Trang cá nhân, lịch hẹn của tôi
│       │   │   ├── orders/     # Lịch sử đơn mua hàng
│       │   │   ├── products/   # Cửa hàng sản phẩm chăm sóc tóc
│       │   │   ├── public/     # Trang chủ (Banner 3D tương tác, Giới thiệu)
│       │   │   ├── reviews/    # Đánh giá dịch vụ
│       │   │   ├── services/   # Bảng giá dịch vụ salon
│       │   │   └── staff/      # Giao diện dành riêng cho thợ xem ca làm
│       │   └── shared/         # UI Components dùng chung (Header, Dialog, Pipes...)
│       ├── styles.scss         # Cấu hình phong cách giao diện toàn cục
│       └── main.ts             # Điểm khởi động ứng dụng Angular
│
├── docs/                       # Tài liệu thiết kế hệ thống, sơ đồ CSDL (erd.md)
├── docker-compose.yml          # Container Docker cho MySQL 8.4 và Mailpit
├── .env.example                # File mẫu các biến môi trường
└── package.json                # Điều phối và khởi chạy toàn dự án (Workspaces)
```

---

## 💻 Yêu cầu môi trường

- **Node.js:** `>=22.22.3` (Khuyến nghị bản LTS hoặc `24.x`)
- **npm:** Phiên bản `11+`
- **Docker Desktop:** Khuyến nghị dùng để khởi chạy tự động CSDL MySQL & Mailpit (hoặc cài đặt sẵn MySQL 8.4 cục bộ).

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Khởi động lần đầu (Setup từ đầu)

Mở Terminal tại thư mục gốc của dự án (`DuAnCatToc`) và thực hiện lần lượt các bước:

```powershell
# Bước 1: Cài đặt tất cả dependencies cho cả frontend và backend
npm install

# Bước 2: Tạo file biến môi trường cho Backend từ file mẫu
Copy-Item .env.example backend/.env

# Bước 3: Khởi động container MySQL và Mailpit qua Docker
docker compose up -d

# Bước 4: Tạo Prisma Client từ schema
npm run db:generate

# Bước 5: Chạy migration để khởi tạo các bảng dữ liệu
npm run db:migrate

# Bước 6: Nạp dữ liệu mẫu ban đầu vào CSDL
npm run db:seed

# Bước 7: Khởi chạy toàn bộ hệ thống (Frontend + Backend đồng thời)
npm run dev
```

---

### 2. Các lần khởi chạy thông thường sau đó

Khi đã thiết lập xong môi trường và CSDL:

* **Chạy song song cả Frontend & Backend:**
  ```powershell
  npm run dev
  ```

* **Hoặc mở 2 cửa sổ dòng lệnh riêng biệt:**
  ```powershell
  # Cửa sổ 1 - Khởi động Backend (Port 3000):
  npm run dev:api

  # Cửa sổ 2 - Khởi động Frontend (Port 4200):
  npm run dev:web
  ```

---

## 🔑 Danh sách tài khoản kiểm thử

Tất cả tài khoản mẫu dưới đây đều dùng chung mật khẩu mặc định: `Password@123`

| Vai trò | Email đăng nhập | Mô tả quyền hạn |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@royalbarber.vn` | Toàn quyền quản trị salon, xem báo cáo, quản lý nhân viên & dịch vụ |
| **Thợ cắt tóc (Staff)** | `minh@royalbarber.vn` | Xem ca trực, danh sách khách hàng đặt hẹn của cá nhân |
| **Thợ cắt tóc (Staff)** | `khoa@royalbarber.vn` | Thợ chuyên tạo kiểu tóc & phục hồi |
| **Khách hàng (Customer)** | `customer@example.com` | Tài khoản khách hàng mẫu có sẵn lịch sử đặt hẹn và đơn hàng |

---

## 🌐 Các đường dẫn & Cổng dịch vụ

| Dịch vụ | Địa chỉ truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Giao diện Web (Frontend)** | [http://localhost:4200](http://localhost:4200) | Giao diện người dùng Angular |
| **Tài liệu API (Swagger UI)** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Xem và thử nghiệm các API trực tiếp |
| **Kiểm tra trạng thái API** | [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) | Kiểm tra server backend đang online |
| **Hộp thư thử nghiệm (Mailpit)** | [http://localhost:8025](http://localhost:8025) | Giao diện xem email gửi đi từ backend |
| **Quản lý dữ liệu (Prisma Studio)** | [http://localhost:5555](http://localhost:5555) | Chạy lệnh `npm run db:studio -w @barber/api` để mở |

---

## 📜 Danh mục lệnh (Scripts Reference)

Các lệnh hữu ích có thể chạy trực tiếp từ thư mục gốc của dự án:

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy đồng thời cả API Server và Giao diện Web bằng `concurrently` |
| `npm run dev:api` | Chỉ khởi chạy riêng Backend ở chế độ tự động reload (`tsx watch`) |
| `npm run dev:web` | Chỉ khởi chạy riêng Frontend Angular (`ng serve`) |
| `npm run build` | Đóng gói sản phẩm (Build cả Backend và Frontend) |
| `npm run db:generate` | Tạo lại Prisma Client khi có cập nhật trong file `schema.prisma` |
| `npm run db:migrate` | Tạo và áp dụng bản migration CSDL mới nhất |
| `npm run db:seed` | Nạp dữ liệu mặc định vào cơ sở dữ liệu |
| `npm run db:studio -w @barber/api` | Mở giao diện đồ họa Prisma Studio trực quan để quản lý CSDL |
