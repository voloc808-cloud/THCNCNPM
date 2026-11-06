import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type {
  AppointmentStatus,
  PageResult,
  StaffAppointment,
  StaffDayOff,
  StaffProfileUser,
  StaffShift,
} from '../models/staff.models';
@Injectable({ providedIn: 'root' })
export class StaffApiService {
  private readonly http = inject(HttpClient);
  getAppointments(page = 1, status?: AppointmentStatus, dateFrom?: string, dateTo?: string) {
    let p = new HttpParams().set('page', page).set('limit', 10);
    if (status) p = p.set('status', status);
    if (dateFrom) p = p.set('dateFrom', dateFrom);
    if (dateTo) p = p.set('dateTo', dateTo);
    return this.http.get<ApiResponse<PageResult<StaffAppointment>>>(
      '/api/v1/staff/me/appointments',
      { params: p },
    );
  }
  updateStatus(id: string, status: AppointmentStatus) {
    return this.http.patch<ApiResponse<StaffAppointment>>(
      `/api/v1/staff/me/appointments/${id}/status`,
      { status },
    );
  }
  getShifts() {
    return this.http.get<ApiResponse<StaffShift[]>>('/api/v1/staff/me/schedule/shifts');
  }
  getDaysOff() {
    return this.http.get<ApiResponse<StaffDayOff[]>>('/api/v1/staff/me/schedule/days-off');
  }
  requestDayOff(body: { startAt: string; endAt: string; reason?: string }) {
    return this.http.post<ApiResponse<StaffDayOff>>('/api/v1/staff/me/schedule/days-off', body);
  }
  cancelDayOff(id: string) {
    return this.http.delete<void>(`/api/v1/staff/me/schedule/days-off/${id}`);
  }
  getProfile() {
    return this.http.get<ApiResponse<StaffProfileUser>>('/api/v1/auth/me');
  }
  updateProfile(body: {
    fullName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    specialties?: string | null;
    yearsOfExperience?: number;
  }) {
    return this.http.patch<ApiResponse<StaffProfileUser>>('/api/v1/auth/me', body);
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<ApiResponse<never>>('/api/v1/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}
