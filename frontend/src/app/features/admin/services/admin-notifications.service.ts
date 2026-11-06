import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, expand, forkJoin, map, reduce } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { AdminAppointment, DayOff } from '../models/admin.models';
import { AdminApiService } from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class AdminNotificationsService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(AdminApiService);
  private readonly readKeys = signal<Set<string>>(new Set());
  private currentUserId = '';
  readonly appointments = signal<AdminAppointment[]>([]);
  readonly daysOff = signal<DayOff[]>([]);
  readonly unreadAppointments = computed(() => this.appointments().filter((item) => this.isAppointmentUnread(item)).length);
  readonly unreadDaysOff = computed(() => this.daysOff().filter((item) => this.isDayOffUnread(item)).length);
  readonly unreadCount = computed(() => this.unreadAppointments() + this.unreadDaysOff());

  refresh() {
    this.ensureUser();
    const appointments = this.api.getAppointments(1, 'PENDING', 100).pipe(
      expand((response) => response.data.meta.page < response.data.meta.totalPages
        ? this.api.getAppointments(response.data.meta.page + 1, 'PENDING', 100)
        : EMPTY),
      map((response) => response.data.items),
      reduce((all, items) => [...all, ...items], [] as AdminAppointment[]),
    );
    forkJoin({ appointments, daysOff: this.api.getDaysOff() }).subscribe({
      next: ({ appointments: pending, daysOff }) => {
        this.appointments.set(pending);
        this.daysOff.set(daysOff.data.filter((item) => item.status === 'PENDING'));
      },
      error: () => undefined,
    });
  }

  isAppointmentUnread(item: AdminAppointment) {
    return item.status === 'PENDING' && !this.readKeys().has(`appointment:${item.id}`);
  }

  isDayOffUnread(item: DayOff) {
    return item.status === 'PENDING' && !this.readKeys().has(`day-off:${item.id}`);
  }

  markAppointmentRead(item: AdminAppointment) {
    this.markRead(`appointment:${item.id}`);
  }

  markDayOffRead(item: DayOff) {
    this.markRead(`day-off:${item.id}`);
  }

  private markRead(key: string) {
    this.ensureUser();
    const keys = new Set(this.readKeys());
    keys.add(key);
    this.readKeys.set(keys);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey(), JSON.stringify([...keys]));
    }
  }

  private loadReadKeys() {
    if (typeof localStorage === 'undefined') return new Set<string>();
    try {
      const value: unknown = JSON.parse(localStorage.getItem(this.storageKey()) || '[]');
      return new Set(Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : []);
    } catch {
      return new Set<string>();
    }
  }

  private ensureUser() {
    const userId = this.auth.user()?.id ?? '';
    if (userId === this.currentUserId) return;
    this.currentUserId = userId;
    this.readKeys.set(this.loadReadKeys());
    this.appointments.set([]);
    this.daysOff.set([]);
  }

  private storageKey() {
    return `royal-barber-admin-read:${this.auth.user()?.id ?? 'unknown'}`;
  }
}
