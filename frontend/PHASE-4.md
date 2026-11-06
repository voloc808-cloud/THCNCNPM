# Frontend – Giai đoạn 4

Angular standalone application với lazy routing, Reactive Forms và HttpClient.

## Cấu trúc chính

```text
src/app/
|-- core/
|   |-- auth/            # AuthService, model và token storage
|   |-- guards/          # auth, guest và role guard
|   |-- interceptors/    # Bearer token + refresh token tự động
|   `-- layouts/header/  # Header responsive
|-- shared/components/   # Portal shell và status pages
`-- features/
    |-- auth/            # Login, register, forgot password
    |-- public/          # Home, services, team
    |-- customer/        # Customer portal
    |-- staff/           # Staff portal
    `-- admin/           # Admin portal
```

## Route

| URL | Quyền |
|---|---|
| `/`, `/dich-vu`, `/doi-ngu` | Công khai |
| `/login`, `/register`, `/quen-mat-khau` | Chưa đăng nhập |
| `/customer` | CUSTOMER |
| `/staff-portal` | STAFF |
| `/admin` | ADMIN |

Guard phía frontend phục vụ trải nghiệm điều hướng; backend vẫn là lớp quyết định quyền cuối cùng.

## Chạy local

```powershell
npm run dev
```

Angular dùng `proxy.conf.json` để chuyển `/api` và `/uploads` sang `http://localhost:3000`. Production cần reverse proxy tương đương hoặc điều chỉnh API base URL.