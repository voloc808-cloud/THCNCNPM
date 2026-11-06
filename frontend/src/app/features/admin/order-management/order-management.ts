import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ApiError } from '../../../core/auth/auth.models';
import type { Order, OrderStatus } from '../../orders/models/order.models';
import { AdminCommerceApiService } from '../services/admin-commerce-api.service';
@Component({
  selector: 'app-order-management',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit {
  private readonly api = inject(AdminCommerceApiService);
  readonly items = signal<Order[]>([]);
  readonly error = signal('');
  readonly notice = signal('');
  filter: OrderStatus | '' = '';
  readonly statuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPING',
    'COMPLETED',
    'CANCELLED',
  ];
  ngOnInit() {
    this.load();
  }
  load() {
    this.api
      .orders(1, this.filter || undefined)
      .subscribe({ next: (r) => this.items.set(r.data.items), error: (e) => this.fail(e) });
  }
  next(status: OrderStatus) {
    return (
      {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPING', 'CANCELLED'],
        SHIPPING: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      } as Record<OrderStatus, OrderStatus[]>
    )[status];
  }
  update(item: Order, status: OrderStatus) {
    if (!confirm(`Chuyển đơn ${item.code} sang “${this.label(status)}”?`)) return;
    this.api.updateOrderStatus(item.id, status).subscribe({
      next: (r) => {
        this.items.update((list) => list.map((x) => (x.id === item.id ? r.data : x)));
        this.notice.set('Đã cập nhật trạng thái đơn.');
      },
      error: (e) => this.fail(e),
    });
  }
  label(s: OrderStatus) {
    return (
      {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        PROCESSING: 'Đang chuẩn bị',
        SHIPPING: 'Đang giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
      } as Record<string, string>
    )[s];
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}
