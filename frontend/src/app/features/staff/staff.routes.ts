import { Routes } from '@angular/router';
import { StaffLayout } from './layout/staff-layout';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: StaffLayout,
    children: [
      {
        path: '',
        title: 'Công việc hôm nay | Royal Barber',
        loadComponent: () => import('./dashboard/staff-dashboard').then((m) => m.StaffDashboard),
      },
      {
        path: 'lich-hen',
        title: 'Lịch hẹn của tôi | Royal Barber',
        loadComponent: () =>
          import('./appointments/staff-appointments').then((m) => m.StaffAppointments),
      },
      {
        path: 'danh-gia',
        title: 'Đánh giá của tôi | Royal Barber',
        loadComponent: () => import('../reviews/reviews-page').then((m) => m.ReviewsPage),
      },
      {
        path: 'lich-lam-viec',
        title: 'Lịch làm việc | Royal Barber',
        loadComponent: () => import('./schedule/staff-schedule').then((m) => m.StaffSchedule),
      },
      {
        path: 'ho-so',
        title: 'Hồ sơ nhân viên | Royal Barber',
        loadComponent: () => import('./profile/staff-profile').then((m) => m.StaffProfile),
      },
    ],
  },
];
