import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AdminAppointment, AppointmentStatus, PageMeta } from '../models/admin.models';
import { AdminApiService } from '../services/admin-api.service';
import { AdminNotificationsService } from '../services/admin-notifications.service';
@Component({
  selector: 'app-appointment-management',
  imports: [FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './appointment-management.html',
  styleUrl: './appointment-management.scss',
})
export class AppointmentManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly notifications = inject(AdminNotificationsService);
  readonly items = signal<AdminAppointment[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly target = signal<AdminAppointment | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  filter: AppointmentStatus | '' = '';
  status: AppointmentStatus = 'PENDING';
  reason = '';
  startAt = '';
  readonly statuses: AppointmentStatus[] = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ];
  ngOnInit() {
    this.load();
  }
  load(page = 1) {
    this.loading.set(true);
    this.api
      .getAppointments(page, this.filter || undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
          this.notifications.refresh();
        },
        error: (e) => this.fail(e),
      });
  }
  open(item: AdminAppointment) {
    this.target.set(item);
    this.status = item.status;
    this.reason = item.cancellationReason ?? '';
    const d = new Date(item.startAt);
    this.startAt = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  close() {
    this.target.set(null);
  }
  saveStatus() {
    const item = this.target();
    if (!item) return;
    this.saving.set(true);
    this.api
      .updateAppointmentStatus(item.id, this.status, this.reason.trim() || undefined)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set('Đã cập nhật trạng thái lịch hẹn.');
          this.close();
          this.load(this.meta()?.page);
        },
        error: (e) => this.fail(e),
      });
  }
  saveTime() {
    const item = this.target();
    if (!item || !this.startAt) return;
    this.saving.set(true);
    this.api
      .reschedule(item.id, { startAt: new Date(this.startAt).toISOString() })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set('Đã đổi thời gian lịch hẹn.');
          this.close();
          this.load(this.meta()?.page);
        },
        error: (e) => this.fail(e),
      });
  }
  label(s: AppointmentStatus) {
    return (
      {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
        NO_SHOW: 'Vắng mặt',
      } as Record<string, string>
    )[s];
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}
