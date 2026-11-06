import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AnalyticsSummary } from '../models/analytics.models';
import { AnalyticsApiService } from '../services/analytics-api.service';
@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly api = inject(AnalyticsApiService);
  readonly data = signal<AnalyticsSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  ngOnInit() {
    this.api.summary().subscribe({
      next: (r) => {
        this.data.set(r.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không thể tải số liệu quản trị.');
        this.loading.set(false);
      },
    });
  }
  width(value: number) {
    const max = Math.max(...(this.data()?.dailyRevenue.map((x) => x.total) ?? [1]), 1);
    return (value / max) * 100;
  }
}
