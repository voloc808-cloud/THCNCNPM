import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
export const routes: Routes = [
  {
    path: '',
    title: 'Royal Barber Studio',
    loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
  },
  {
    path: 'dich-vu',
    loadChildren: () =>
      import('./features/services/services.routes').then((m) => m.SERVICES_ROUTES),
  },
  {
    path: 'san-pham',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
  {
    path: 'gio-hang',
    title: 'Giỏ hàng | Royal Barber',
    loadComponent: () =>
      import('./features/cart/pages/cart-page/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'thanh-toan',
    title: 'Thanh toán | Royal Barber',
    canActivate: [authGuard, roleGuard(['CUSTOMER'])],
    loadComponent: () =>
      import('./features/cart/pages/checkout-page/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'don-hang',
    title: 'Đơn hàng của tôi | Royal Barber',
    canActivate: [authGuard, roleGuard(['CUSTOMER'])],
    loadComponent: () =>
      import('./features/orders/pages/order-history/order-history').then((m) => m.OrderHistory),
  },
  {
    path: 'doi-ngu',
    title: 'Đội ngũ | Royal Barber',
    loadComponent: () => import('./features/staff/team/team-page').then((m) => m.TeamPage),
  },
  {
    path: 'login',
    title: 'Đăng nhập | Royal Barber',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Đăng ký | Royal Barber',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'quen-mat-khau',
    title: 'Quên mật khẩu | Royal Barber',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard(['CUSTOMER'])],
    loadChildren: () =>
      import('./features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  },
  {
    path: 'staff-portal',
    canActivate: [authGuard, roleGuard(['STAFF'])],
    loadChildren: () => import('./features/staff/staff.routes').then((m) => m.STAFF_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'khong-co-quyen',
    title: 'Không có quyền',
    loadComponent: () =>
      import('./shared/components/status-page/status-page').then((m) => m.StatusPage),
    data: {
      code: '403',
      title: 'Không có quyền truy cập',
      message: 'Tài khoản của bạn không được phép mở khu vực này.',
    },
  },
  {
    path: '**',
    title: 'Không tìm thấy',
    loadComponent: () =>
      import('./shared/components/status-page/status-page').then((m) => m.StatusPage),
    data: {
      code: '404',
      title: 'Trang không tồn tại',
      message: 'Có vẻ đường dẫn này đã thay đổi hoặc không còn tồn tại.',
    },
  },
];
