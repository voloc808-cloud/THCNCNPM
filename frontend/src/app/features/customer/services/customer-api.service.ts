import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type {
  Appointment,
  AppointmentStatus,
  Availability,
  PageResult,
  ProfileUser,
  ServiceItem,
  StaffItem,
} from '../models/customer.models';
@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  getServices() {
    return this.http.get<ApiResponse<PageResult<ServiceItem>>>('/api/v1/services', {
      params: { page: 1, limit: 100 },
    });
  }
  getLookbook() {
    return this.http.get<
      ApiResponse<
        Array<{ id: string; title: string; imageUrl: string; isActive: boolean; sortOrder: number }>
      >
    >('/api/v1/lookbook');
  }
  getStaff() {
    return this.http.get<ApiResponse<PageResult<StaffItem>>>('/api/v1/staff', {
      params: { page: 1, limit: 100 },
    });
  }
  getAvailability(date: string, serviceIds: string[], staffId?: string) {
    let params = new HttpParams().set('date', date).set('serviceIds', serviceIds.join(','));
    if (staffId) params = params.set('staffId', staffId);
    return this.http.get<ApiResponse<Availability>>('/api/v1/availability', { params });
  }
  createAppointment(input: {
    serviceIds: string[];
    staffId?: string;
    startAt: string;
    customerNote?: string;
  }) {
    return this.http.post<ApiResponse<Appointment>>('/api/v1/appointments', input);
  }
  getAppointments(page = 1, status?: AppointmentStatus) {
    let params = new HttpParams().set('page', page).set('limit', 10);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResult<Appointment>>>('/api/v1/appointments', { params });
  }
  getAppointment(id: string) {
    return this.http.get<ApiResponse<Appointment>>(`/api/v1/appointments/${id}`);
  }
  cancelAppointment(id: string, reason: string) {
    return this.http.patch<ApiResponse<Appointment>>(`/api/v1/appointments/${id}/cancel`, {
      reason,
    });
  }
  reviewAppointment(id: string, rating: number, comment?: string) {
    return this.http.post<ApiResponse<{ id: string; rating: number; comment: string | null }>>(
      `/api/v1/reviews/appointments/${id}`,
      { rating, comment },
    );
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<ApiResponse<never>>('/api/v1/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
  getProfile() {
    return this.http.get<ApiResponse<ProfileUser>>('/api/v1/auth/me');
  }
  updateProfile(input: {
    fullName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
  }) {
    return this.http.patch<ApiResponse<ProfileUser>>('/api/v1/auth/me', input);
  }
}
