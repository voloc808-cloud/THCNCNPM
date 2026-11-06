import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter, timer } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AdminNotificationsService } from '../../../features/admin/services/admin-notifications.service';
import { DayOffNotificationsService } from '../../../features/staff/services/day-off-notifications.service';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly adminNotifications = inject(AdminNotificationsService);
  private readonly staffNotifications = inject(DayOffNotificationsService);
  readonly unreadCount = computed(() => this.auth.role() === 'ADMIN'
    ? this.adminNotifications.unreadCount()
    : this.auth.role() === 'STAFF' ? this.staffNotifications.unreadCount() : 0);
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();
  ngOnInit() {
    this.subscriptions.add(timer(0, 30_000).subscribe(() => this.refreshNotifications()));
    this.subscriptions.add(this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.refreshNotifications()));
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  private refreshNotifications() {
    if (this.auth.role() === 'ADMIN') this.adminNotifications.refresh();
    if (this.auth.role() === 'STAFF') this.staffNotifications.refresh();
  }
  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
  logout() {
    this.auth.logout();
    this.closeMenu();
    void this.router.navigate(['/']);
  }
}
