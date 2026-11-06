import { Routes } from '@angular/router';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    title: 'Dịch vụ | Royal Barber',
    loadComponent: () => import('./pages/services-page').then((m) => m.ServicesPage),
  },
];
