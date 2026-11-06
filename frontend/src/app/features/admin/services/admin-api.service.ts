import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type {
  AdminAppointment,
  AdminCustomer,
  AdminService,
  AdminStaff,
  AppointmentStatus,
  DayOff,
  PageResult,
  StaffShift,
  UserStatus,
} from '../models/admin.models';
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private params(page = 1, search = '') {
    let p = new HttpParams().set('page', page).set('limit', 10);
    if (search) p = p.set('search', search);
    return p;
  }
  getServices(page = 1, search = '') {
    return this.http.get<ApiResponse<PageResult<AdminService>>>('/api/v1/admin/services', {
      params: this.params(page, search),
    });
  }
  createService(body: Partial<AdminService>) {
    return this.http.post<ApiResponse<AdminService>>('/api/v1/admin/services', body);
  }
  updateService(id: string, body: Partial<AdminService>) {
    return this.http.patch<ApiResponse<AdminService>>(`/api/v1/admin/services/${id}`, body);
  }
  deleteService(id: string) {
    return this.http.delete<void>(`/api/v1/admin/services/${id}`);
  }
  getStaff(page = 1, search = '') {
    return this.http.get<ApiResponse<PageResult<AdminStaff>>>('/api/v1/admin/staff', {
      params: this.params(page, search),
    });
  }
  createStaff(body: Record<string, unknown>) {
    return this.http.post<ApiResponse<AdminStaff>>('/api/v1/admin/staff', body);
  }
  updateStaff(id: string, body: Record<string, unknown>) {
    return this.http.patch<ApiResponse<AdminStaff>>(`/api/v1/admin/staff/${id}`, body);
  }
  deleteStaff(id: string) {
    return this.http.delete<void>(`/api/v1/admin/staff/${id}`);
  }
  getCustomers(page = 1, search = '') {
    return this.http.get<ApiResponse<PageResult<AdminCustomer>>>('/api/v1/admin/customers', {
      params: this.params(page, search),
    });
  }
  createCustomer(body: Record<string, unknown>) {
    return this.http.post<ApiResponse<AdminCustomer>>('/api/v1/admin/customers', body);
  }
  updateCustomer(id: string, body: Record<string, unknown>) {
    return this.http.patch<ApiResponse<AdminCustomer>>(`/api/v1/admin/customers/${id}`, body);
  }
  setCustomerPassword(id: string, newPassword: string) {
    return this.http.patch<ApiResponse<null>>(`/api/v1/admin/customers/${id}/password`, {
      newPassword,
    });
  }
  deleteCustomer(id: string) {
    return this.http.delete<void>(`/api/v1/admin/customers/${id}`);
  }
  getLookbook() {
    return this.http.get<
      ApiResponse<import('../lookbook-management/lookbook-management').LookbookItem[]>
    >('/api/v1/admin/lookbook');
  }
  createLookbook(body: Record<string, unknown>) {
    return this.http.post<
      ApiResponse<import('../lookbook-management/lookbook-management').LookbookItem>
    >('/api/v1/admin/lookbook', body);
  }
  updateLookbook(id: string, body: Record<string, unknown>) {
    return this.http.patch<
      ApiResponse<import('../lookbook-management/lookbook-management').LookbookItem>
    >(`/api/v1/admin/lookbook/${id}`, body);
  }
  deleteLookbook(id: string) {
    return this.http.delete<void>(`/api/v1/admin/lookbook/${id}`);
  }
  uploadImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<ApiResponse<{ filename: string; imageUrl: string }>>(
      '/api/v1/admin/uploads/images',
      form,
    );
  }
  getAppointments(page = 1, status?: AppointmentStatus, limit = 10) {
    let p = this.params(page).set('limit', limit);
    if (status) p = p.set('status', status);
    return this.http.get<ApiResponse<PageResult<AdminAppointment>>>('/api/v1/admin/appointments', {
      params: p,
    });
  }
  updateAppointmentStatus(id: string, status: AppointmentStatus, reason?: string) {
    return this.http.patch<ApiResponse<AdminAppointment>>(
      `/api/v1/admin/appointments/${id}/status`,
      { status, reason },
    );
  }
  reschedule(id: string, body: { staffId?: string; startAt: string }) {
    return this.http.patch<ApiResponse<AdminAppointment>>(
      `/api/v1/admin/appointments/${id}/reschedule`,
      body,
    );
  }
  getShifts(staffId: string) {
    return this.http.get<ApiResponse<StaffShift[]>>(
      `/api/v1/admin/schedule/staff/${staffId}/shifts`,
    );
  }
  createShift(staffId: string, body: Record<string, unknown>) {
    return this.http.post<ApiResponse<StaffShift>>(
      `/api/v1/admin/schedule/staff/${staffId}/shifts`,
      body,
    );
  }
  updateShift(staffId: string, id: string, body: Record<string, unknown>) {
    return this.http.patch<ApiResponse<StaffShift>>(
      `/api/v1/admin/schedule/staff/${staffId}/shifts/${id}`,
      body,
    );
  }
  deleteShift(staffId: string, id: string) {
    return this.http.delete<void>(`/api/v1/admin/schedule/staff/${staffId}/shifts/${id}`);
  }
  getDaysOff() {
    return this.http.get<ApiResponse<DayOff[]>>('/api/v1/admin/schedule/days-off');
  }
  reviewDayOff(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.http.patch<ApiResponse<DayOff>>(`/api/v1/admin/schedule/days-off/${id}`, {
      status,
    });
  }
}
