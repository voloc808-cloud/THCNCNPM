import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { Appointment, AppointmentStatus, PageMeta } from '../models/customer.models';
import { CustomerApiService } from '../services/customer-api.service';
@Component({
  selector: 'app-appointment-history',
  imports: [DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
})
export class AppointmentHistory implements OnInit {
  private readonly api = inject(CustomerApiService);
  readonly items = signal<Appointment[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly filter = signal<AppointmentStatus | ''>('');
  readonly cancelTarget = signal<Appointment | null>(null);
  readonly reviewTarget = signal<Appointment | null>(null);
  cancelReason = '';
  reviewComment = '';
  rating = 5;
  readonly statuses: Array<{ value: AppointmentStatus | ''; label: string }> = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'NO_SHOW', label: 'Vắng mặt' },
  ];
  ngOnInit() {
    this.load();
  }
  load(page = 1) {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getAppointments(page, this.filter() || undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
        },
        error: (e) => this.setError(e),
      });
  }
  setFilter(status: AppointmentStatus | '') {
    this.filter.set(status);
    this.load();
  }
  statusLabel(status: AppointmentStatus) {
    return this.statuses.find((item) => item.value === status)?.label ?? status;
  }
  canCancel(item: Appointment) {
    return (
      ['PENDING', 'CONFIRMED'].includes(item.status) &&
      new Date(item.startAt).getTime() - Date.now() >= 2 * 3600000
    );
  }
  openCancel(item: Appointment) {
    this.cancelReason = '';
    this.cancelTarget.set(item);
  }
  confirmCancel() {
    const item = this.cancelTarget();
    if (!item || this.cancelReason.trim().length < 3) return;
    this.actionLoading.set(true);
    this.api
      .cancelAppointment(item.id, this.cancelReason.trim())
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.cancelTarget.set(null);
          this.notice.set('Lịch hẹn đã được hủy.');
          this.load(this.meta()?.page);
        },
        error: (e) => this.setError(e),
      });
  }
  openReview(item: Appointment) {
    this.rating = 5;
    this.reviewComment = '';
    this.reviewTarget.set(item);
  }
  submitReview() {
    const item = this.reviewTarget();
    if (!item) return;
    this.actionLoading.set(true);
    this.api
      .reviewAppointment(item.id, this.rating, this.reviewComment.trim() || undefined)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.reviewTarget.set(null);
          this.notice.set('Cảm ơn bạn đã chia sẻ đánh giá.');
          this.load(this.meta()?.page);
        },
        error: (e) => this.setError(e),
      });
  }
  private setError(error: HttpErrorResponse) {
    this.error.set((error.error as ApiError)?.message ?? 'Không thể tải dữ liệu.');
  }
}
