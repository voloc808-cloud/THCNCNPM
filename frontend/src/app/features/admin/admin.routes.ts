import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        title: 'Tổng quan quản trị | Royal Barber',
        loadComponent: () => import('./dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'dich-vu',
        title: 'Quản lý dịch vụ | Royal Barber',
        loadComponent: () =>
          import('./services-management/services-management').then((m) => m.ServicesManagement),
      },
      {
        path: 'bo-suu-tap',
        title: 'Quản lý bộ sưu tập | Royal Barber',
        loadComponent: () =>
          import('./lookbook-management/lookbook-management').then((m) => m.LookbookManagement),
      },
      {
        path: 'san-pham',
        title: 'Quản lý sản phẩm | Royal Barber',
        loadComponent: () =>
          import('./product-management/product-management').then((m) => m.ProductManagement),
      },
      {
        path: 'don-hang',
        title: 'Quản lý đơn hàng | Royal Barber',
        loadComponent: () =>
          import('./order-management/order-management').then((m) => m.OrderManagement),
      },
      {
        path: 'bao-cao',
        title: 'Báo cáo & thống kê | Royal Barber',
        loadComponent: () => import('./analytics/admin-analytics').then((m) => m.AdminAnalytics),
      },
      {
        path: 'nhan-vien',
        title: 'Quản lý nhân viên | Royal Barber',
        loadComponent: () =>
          import('./staff-management/staff-management').then((m) => m.StaffManagement),
      },
      {
        path: 'khach-hang',
        title: 'Quản lý khách hàng | Royal Barber',
        loadComponent: () =>
          import('./customer-management/customer-management').then((m) => m.CustomerManagement),
      },
      {
        path: 'lich-hen',
        title: 'Quản lý lịch hẹn | Royal Barber',
        loadComponent: () =>
          import('./appointment-management/appointment-management').then(
            (m) => m.AppointmentManagement,
          ),
      },
      {
        path: 'danh-gia',
        title: 'Đánh giá khách hàng | Royal Barber',
        loadComponent: () => import('../reviews/reviews-page').then((m) => m.ReviewsPage),
      },
      {
        path: 'lich-lam-viec',
        title: 'Lịch làm việc | Royal Barber',
        loadComponent: () =>
          import('./schedule-management/schedule-management').then((m) => m.ScheduleManagement),
      },
    ],
  },
];
