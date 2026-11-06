import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import type { StaffAppointment } from '../models/staff.models';
import { StaffApiService } from '../services/staff-api.service';
@Component({
  selector: 'app-staff-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.scss',
})
export class StaffDashboard implements OnInit {
  private readonly api = inject(StaffApiService);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly today = signal<StaffAppointment[]>([]);
  readonly stats = signal({ today: 0, pending: 0, confirmed: 0 });
  ngOnInit() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    forkJoin({
      today: this.api.getAppointments(1, undefined, start.toISOString(), end.toISOString()),
      pending: this.api.getAppointments(1, 'PENDING'),
      confirmed: this.api.getAppointments(1, 'CONFIRMED'),
    }).subscribe({
      next: (r) => {
        this.today.set(r.today.data.items);
        this.stats.set({
          today: r.today.data.meta.total,
          pending: r.pending.data.meta.total,
          confirmed: r.confirmed.data.meta.total,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không thể tải công việc hôm nay.');
        this.loading.set(false);
      },
    });
  }
}
