import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import type { ApiError } from '../../../../core/auth/auth.models';
import type { Order, OrderStatus } from '../../models/order.models';
import { OrderApiService } from '../../services/order-api.service';
@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistory implements OnInit {
  private readonly api = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  readonly items = signal<Order[]>([]);
  readonly loading = signal(true);
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
    const created = this.route.snapshot.queryParamMap.get('created');
    if (created) this.notice.set(`Đặt hàng thành công: ${created}`);
    this.load();
  }
  load() {
    this.loading.set(true);
    this.api.mine(1, this.filter || undefined).subscribe({
      next: (r) => {
        this.items.set(r.data.items);
        this.loading.set(false);
      },
      error: (e) => {
        this.fail(e);
        this.loading.set(false);
      },
    });
  }
  cancel(item: Order) {
    if (!confirm(`Hủy đơn ${item.code}?`)) return;
    this.api.cancel(item.id).subscribe({
      next: (r) => {
        this.items.update((list) => list.map((x) => (x.id === item.id ? r.data : x)));
        this.notice.set('Đã hủy đơn hàng.');
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
    this.error.set((e.error as ApiError)?.message ?? 'Không thể tải đơn hàng.');
  }
}
