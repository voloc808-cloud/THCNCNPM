import { Routes } from '@angular/router';
import { CustomerLayout } from './customer-layout/customer-layout';
export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerLayout,
    children: [
      {
        path: '',
        title: 'Khách hàng | Royal Barber',
        loadComponent: () =>
          import('./dashboard/customer-dashboard').then((m) => m.CustomerDashboard),
      },
      {
        path: 'dat-lich',
        title: 'Đặt lịch | Royal Barber',
        loadComponent: () => import('./booking/booking-wizard').then((m) => m.BookingWizard),
      },
      {
        path: 'lich-hen',
        title: 'Lịch hẹn | Royal Barber',
        loadComponent: () =>
          import('./appointments/appointment-history').then((m) => m.AppointmentHistory),
      },
      {
        path: 'ho-so',
        title: 'Hồ sơ | Royal Barber',
        loadComponent: () => import('./profile/customer-profile').then((m) => m.CustomerProfile),
      },
    ],
  },
];
