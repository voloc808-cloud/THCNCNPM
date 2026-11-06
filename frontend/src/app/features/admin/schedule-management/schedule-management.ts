import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AdminStaff, DayOff, StaffShift } from '../models/admin.models';
import { AdminApiService } from '../services/admin-api.service';
import { AdminNotificationsService } from '../services/admin-notifications.service';
@Component({
  selector: 'app-schedule-management',
  imports: [FormsModule, DatePipe],
  templateUrl: './schedule-management.html',
  styleUrl: './schedule-management.scss',
})
export class ScheduleManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly notifications = inject(AdminNotificationsService);
  readonly staff = signal<AdminStaff[]>([]);
  readonly shifts = signal<StaffShift[]>([]);
  readonly daysOff = signal<DayOff[]>([]);
  readonly error = signal('');
  readonly notice = signal('');
  selectedStaff = '';
  dayOfWeek = 1;
  startTime = '08:00';
  endTime = '17:00';
  readonly days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  ngOnInit() {
    forkJoin({ staff: this.api.getStaff(1), days: this.api.getDaysOff() }).subscribe({
      next: (r) => {
        this.staff.set(r.staff.data.items);
        this.daysOff.set(r.days.data);
        this.notifications.refresh();
        if (r.staff.data.items[0]) {
          this.selectedStaff = r.staff.data.items[0].id;
          this.loadShifts();
        }
      },
      error: (e) => this.fail(e),
    });
  }
  loadShifts() {
    if (!this.selectedStaff) {
      this.shifts.set([]);
      return;
    }
    this.api
      .getShifts(this.selectedStaff)
      .subscribe({ next: (r) => this.shifts.set(r.data), error: (e) => this.fail(e) });
  }
  addShift() {
    this.api
      .createShift(this.selectedStaff, {
        dayOfWeek: this.dayOfWeek,
        startTime: this.startTime,
        endTime: this.endTime,
        isActive: true,
      })
      .subscribe({
        next: () => {
          this.notice.set('Đã thêm ca làm việc.');
          this.loadShifts();
        },
        error: (e) => this.fail(e),
      });
  }
  toggle(shift: StaffShift) {
    this.api
      .updateShift(this.selectedStaff, shift.id, { isActive: !shift.isActive })
      .subscribe({ next: () => this.loadShifts(), error: (e) => this.fail(e) });
  }
  remove(shift: StaffShift) {
    if (!confirm('Xóa ca làm việc này?')) return;
    this.api
      .deleteShift(this.selectedStaff, shift.id)
      .subscribe({ next: () => this.loadShifts(), error: (e) => this.fail(e) });
  }
  review(item: DayOff, status: 'APPROVED' | 'REJECTED') {
    this.api.reviewDayOff(item.id, status).subscribe({
      next: (r) => {
        this.daysOff.update((items) => items.map((x) => (x.id === item.id ? r.data : x)));
        this.notifications.refresh();
        this.notice.set('Đã xử lý yêu cầu nghỉ.');
      },
      error: (e) => this.fail(e),
    });
  }
  time(value: string) {
    return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}
