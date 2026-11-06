import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AnalyticsSummary } from '../models/analytics.models';
import { AnalyticsApiService } from '../services/analytics-api.service';
@Component({
  selector: 'app-admin-analytics',
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.scss',
})
export class AdminAnalytics implements OnInit {
  private readonly api = inject(AnalyticsApiService);
  readonly data = signal<AnalyticsSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  dateFrom = '';
  dateTo = '';
  ngOnInit() {
    const to = new Date(),
      from = new Date(to.getTime() - 29 * 86400000);
    this.dateFrom = this.local(from);
    this.dateTo = this.local(to);
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.summary(this.dateFrom, this.dateTo).subscribe({
      next: (r) => {
        this.data.set(r.data);
        this.loading.set(false);
      },
      error: (e) => {
        this.fail(e);
        this.loading.set(false);
      },
    });
  }
  height(value: number) {
    const max = Math.max(...(this.data()?.dailyRevenue.map((x) => x.total) ?? [1]), 1);
    return Math.max(value ? 4 : 1, (value / max) * 100);
  }
  exportCsv() {
    this.api.csv(this.dateFrom, this.dateTo).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = `royal-barber-${this.dateFrom}-${this.dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.fail(e),
    });
  }
  private local(d: Date) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể tải báo cáo.');
  }
}
