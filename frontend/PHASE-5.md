# Frontend – Giai đoạn 5: 3D Scroll Storytelling

Trang chủ dùng Three.js dựng cảnh bằng hình khối cơ bản, không phụ thuộc file `.glb`. Cảnh gồm ghế barber, kéo, tông đơ, lược, sàn và hạt bụi ánh kim.

## Hiệu ứng

- Camera và cụm vật thể chuyển động theo tiến độ cuộn bằng GSAP ScrollTrigger.
- Nội dung dùng reveal fade/slide và parallax có kiểm soát.
- Cảnh 3D giữ phía sau tám chapter: hero, giới thiệu, dịch vụ, đội ngũ, gallery, đánh giá, bảng giá, liên hệ và CTA.
- Three.js, GSAP và ScrollTrigger đều được dynamic import trong lazy chunk trang chủ.

## Hiệu năng và khả năng tiếp cận

- IntersectionObserver chỉ khởi tạo WebGL khi trang chủ vào gần viewport.
- Pixel ratio tối đa `1.6`; thiết bị mobile/yếu giới hạn ở `1.0` và giảm số particle.
- `prefers-reduced-motion` render một khung tĩnh, không chạy animation loop hoặc ScrollTrigger.
- Loading screen hiển thị tiến độ; nếu WebGL lỗi sẽ dùng fallback đồ họa CSS.
- ResizeObserver cập nhật camera/renderer; mọi geometry, material, RAF, listener và ScrollTrigger đều được giải phóng khi rời route.

## Dùng mô hình GLB sau này

Đặt file vào `frontend/public/models/barber-shop.glb`, sau đó trong `barber-scene.ts` dynamic import `GLTFLoader` từ `three/examples/jsm/loaders/GLTFLoader.js`. Thay lời gọi `buildScene(...)` bằng loader và thêm model vào `world`. Nên dùng Draco/KTX2 và giữ file dưới khoảng 3–5 MB cho mobile.

## Kiểm tra

```powershell
npm run build -w web
npm run dev:web
```

Mở `http://localhost:4200`, cuộn toàn trang và kiểm tra thêm bằng Chrome DevTools với chế độ mobile cùng tùy chọn “Emulate CSS media feature prefers-reduced-motion”.