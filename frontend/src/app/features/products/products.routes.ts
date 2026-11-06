import { Routes } from '@angular/router';
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Sản phẩm | Royal Barber',
    loadComponent: () => import('./pages/products-page').then((m) => m.ProductsPage),
  },
  {
    path: ':slug',
    title: 'Chi tiết sản phẩm | Royal Barber',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
];
