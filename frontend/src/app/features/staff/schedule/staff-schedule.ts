import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { StaffDayOff, StaffShift } from '../models/staff.models';
import { StaffApiService } from '../services/staff-api.service';
import { DayOffNotificationsService } from '../services/day-off-notifications.service';
@Component({
  selector: 'app-staff-schedule',
  imports: [FormsModule, DatePipe],
  templateUrl: './staff-schedule.html',
  styleUrl: './staff-schedule.scss',
})
export class StaffSchedule implements OnInit {
  private readonly api = inject(StaffApiService);
  readonly notifications = inject(DayOffNotificationsService);
  readonly shifts = signal<StaffShift[]>([]);
  readonly daysOff = signal<StaffDayOff[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  startDate = '';
  endDate = '';
  startTime = '00:00';
  endTime = '23:59';
  reason = '';
  readonly days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  ngOnInit() {
    this.load();
  }
  load() {
    forkJoin({ shifts: this.api.getShifts(), daysOff: this.api.getDaysOff() }).subscribe({
      next: (r) => {
        this.shifts.set(r.shifts.data);
        this.daysOff.set(r.daysOff.data);
        this.notifications.daysOff.set(r.daysOff.data);
        this.loading.set(false);
      },
      error: (e) => {
        this.fail(e);
        this.loading.set(false);
      },
    });
  }
  request() {
    if (!this.startDate || !this.endDate) return;
    const startAt = new Date(`${this.startDate}T${this.startTime}`);
    const endAt = new Date(`${this.endDate}T${this.endTime}`);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
      this.error.set('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    this.error.set('');
    this.saving.set(true);
    this.api
      .requestDayOff({
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reason: this.reason.trim() || undefined,
      })
      .subscribe({
        next: (r) => {
          this.daysOff.update((items) => [r.data, ...items]);
          this.notifications.daysOff.update((items) => [r.data, ...items]);
          this.notice.set('Đã gửi yêu cầu nghỉ.');
          this.startDate = '';
          this.endDate = '';
          this.startTime = '00:00';
          this.endTime = '23:59';
          this.reason = '';
          this.saving.set(false);
        },
        error: (e) => {
          this.fail(e);
          this.saving.set(false);
        },
      });
  }
  openDatePicker(input: HTMLInputElement) {
    if (input.showPicker) input.showPicker();
    else input.focus();
  }
  cancel(item: StaffDayOff) {
    if (!confirm('Hủy yêu cầu nghỉ này?')) return;
    this.api.cancelDayOff(item.id).subscribe({
      next: () => {
        this.daysOff.update((items) => items.filter((x) => x.id !== item.id));
        this.notifications.daysOff.update((items) => items.filter((x) => x.id !== item.id));
        this.notice.set('Đã hủy yêu cầu nghỉ.');
      },
      error: (e) => this.fail(e),
    });
  }
  time(value: string) {
    return new Date(value).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  }
  statusText(status: StaffDayOff['status']) {
    return {
      PENDING: 'Đang chờ duyệt',
      APPROVED: 'Đã được duyệt',
      REJECTED: 'Đã bị từ chối',
    }[status];
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}
