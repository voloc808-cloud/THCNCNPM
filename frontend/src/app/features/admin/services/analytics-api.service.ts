import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type { AnalyticsSummary } from '../models/analytics.models';
@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
  private params(dateFrom?: string, dateTo?: string) {
    let p = new HttpParams();
    if (dateFrom) p = p.set('dateFrom', dateFrom);
    if (dateTo) p = p.set('dateTo', dateTo);
    return p;
  }
  summary(dateFrom?: string, dateTo?: string) {
    return this.http.get<ApiResponse<AnalyticsSummary>>('/api/v1/admin/analytics/summary', {
      params: this.params(dateFrom, dateTo),
    });
  }
  csv(dateFrom?: string, dateTo?: string) {
    return this.http.get('/api/v1/admin/analytics/export.csv', {
      params: this.params(dateFrom, dateTo),
      responseType: 'blob',
    });
  }
}
