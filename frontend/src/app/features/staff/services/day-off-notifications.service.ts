import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import type { StaffDayOff } from '../models/staff.models';
import { StaffApiService } from './staff-api.service';

@Injectable({ providedIn: 'root' })
export class DayOffNotificationsService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StaffApiService);
  private readonly readKeys = signal<Set<string>>(new Set());
  private currentUserId = '';
  readonly daysOff = signal<StaffDayOff[]>([]);
  readonly unreadCount = computed(() => this.daysOff().filter((item) => this.isUnread(item)).length);

  refresh() {
    this.ensureUser();
    this.api.getDaysOff().subscribe({
      next: ({ data }) => this.daysOff.set(data),
      error: () => undefined,
    });
  }

  isUnread(item: StaffDayOff) {
    return !this.readKeys().has(`${item.id}:${item.status}`);
  }

  markRead(item: StaffDayOff) {
    this.ensureUser();
    const keys = new Set(this.readKeys());
    keys.add(`${item.id}:${item.status}`);
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
    this.daysOff.set([]);
  }

  private storageKey() {
    return `royal-barber-day-off-read:${this.auth.user()?.id ?? 'unknown'}`;
  }
}
