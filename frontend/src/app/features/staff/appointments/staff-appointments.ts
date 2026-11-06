import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AppointmentStatus, PageMeta, StaffAppointment } from '../models/staff.models';
import { StaffApiService } from '../services/staff-api.service';
@Component({
  selector: 'app-staff-appointments',
  imports: [FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './staff-appointments.html',
  styleUrl: './staff-appointments.scss',
})
export class StaffAppointments implements OnInit {
  private readonly api = inject(StaffApiService);
  readonly items = signal<StaffAppointment[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly loading = signal(false);
  readonly actionId = signal('');
  readonly error = signal('');
  readonly notice = signal('');
  filter: AppointmentStatus | '' = '';
  dateFrom = '';
  dateTo = '';
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
      .getAppointments(
        page,
        this.filter || undefined,
        this.dateFrom ? new Date(this.dateFrom + 'T00:00:00').toISOString() : undefined,
        this.dateTo ? new Date(this.dateTo + 'T23:59:59').toISOString() : undefined,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
        },
        error: (e) => this.fail(e),
      });
  }
  allowed(item: StaffAppointment) {
    return item.status === 'PENDING'
      ? ['CONFIRMED' as AppointmentStatus]
      : item.status === 'CONFIRMED'
        ? (['COMPLETED', 'NO_SHOW'] as AppointmentStatus[])
        : [];
  }
  update(item: StaffAppointment, status: AppointmentStatus) {
    if (!confirm(`Chuyển lịch ${item.code} sang “${this.label(status)}”?`)) return;
    this.actionId.set(item.id);
    this.api
      .updateStatus(item.id, status)
      .pipe(finalize(() => this.actionId.set('')))
      .subscribe({
        next: () => {
          this.notice.set('Đã cập nhật trạng thái lịch hẹn.');
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
        NO_SHOW: 'Khách vắng',
      } as Record<string, string>
    )[s];
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}
