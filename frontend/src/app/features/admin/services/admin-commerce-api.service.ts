import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type { PageResult, Product, ProductCategory } from '../../products/models/product.models';
import type { Order, OrderPage, OrderStatus } from '../../orders/models/order.models';
@Injectable({ providedIn: 'root' })
export class AdminCommerceApiService {
  private readonly http = inject(HttpClient);
  products(page = 1, search = '') {
    let p = new HttpParams().set('page', page).set('limit', 10);
    if (search) p = p.set('search', search);
    return this.http.get<ApiResponse<PageResult<Product>>>('/api/v1/admin/products', { params: p });
  }
  categories() {
    return this.http.get<ApiResponse<(ProductCategory & { _count?: { products: number } })[]>>(
      '/api/v1/admin/products/categories',
    );
  }
  createCategory(body: Record<string, unknown>) {
    return this.http.post<ApiResponse<ProductCategory>>('/api/v1/admin/products/categories', body);
  }
  updateCategory(id: string, body: Record<string, unknown>) {
    return this.http.patch<ApiResponse<ProductCategory>>(
      `/api/v1/admin/products/categories/${id}`,
      body,
    );
  }
  deleteCategory(id: string) {
    return this.http.delete<void>(`/api/v1/admin/products/categories/${id}`);
  }
  createProduct(body: Record<string, unknown>) {
    return this.http.post<ApiResponse<Product>>('/api/v1/admin/products', body);
  }
  updateProduct(id: string, body: Record<string, unknown>) {
    return this.http.patch<ApiResponse<Product>>(`/api/v1/admin/products/${id}`, body);
  }
  deleteProduct(id: string) {
    return this.http.delete<void>(`/api/v1/admin/products/${id}`);
  }
  uploadImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<ApiResponse<{ filename: string; imageUrl: string }>>(
      '/api/v1/admin/uploads/images',
      form,
    );
  }
  orders(page = 1, status?: OrderStatus) {
    let p = new HttpParams().set('page', page).set('limit', 10);
    if (status) p = p.set('status', status);
    return this.http.get<ApiResponse<OrderPage>>('/api/v1/admin/orders', { params: p });
  }
  updateOrderStatus(id: string, status: OrderStatus) {
    return this.http.patch<ApiResponse<Order>>(`/api/v1/admin/orders/${id}/status`, { status });
  }
}
