import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type { Order, OrderPage, OrderStatus } from '../models/order.models';
@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  create(body: Record<string, unknown>) {
    return this.http.post<ApiResponse<Order>>('/api/v1/orders', body);
  }
  mine(page = 1, status?: OrderStatus) {
    let p = new HttpParams().set('page', page).set('limit', 10);
    if (status) p = p.set('status', status);
    return this.http.get<ApiResponse<OrderPage>>('/api/v1/orders', { params: p });
  }
  cancel(id: string) {
    return this.http.patch<ApiResponse<Order>>(`/api/v1/orders/${id}/cancel`, {});
  }
}
