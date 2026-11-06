import type { User } from '../../../core/auth/auth.models';
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
}
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export interface StaffAppointment {
  id: string;
  code: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  totalPrice: string | number;
  totalDurationMinutes: number;
  customerNote: string | null;
  customer: {
    id: string;
    user: { fullName: string; email: string; phone: string | null; avatarUrl: string | null };
  };
  services: Array<{
    serviceId: string;
    serviceName: string;
    price: string | number;
    durationMinutes: number;
  }>;
}
export interface StaffShift {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
export interface StaffDayOff {
  id: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}
export interface StaffProfileUser extends User {
  staffProfile?: {
    id: string;
    bio: string | null;
    specialties: string | null;
    yearsOfExperience: number;
    averageRating: string | number;
    isBookable: boolean;
  };
}
