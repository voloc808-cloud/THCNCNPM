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
export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
}
export interface StaffItem {
  id: string;
  bio: string | null;
  specialties: string | null;
  yearsOfExperience: number;
  averageRating: string | number;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  services: Array<{ service: ServiceItem }>;
}
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export interface Appointment {
  id: string;
  code: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  totalDurationMinutes: number;
  totalPrice: string | number;
  customerNote: string | null;
  cancellationReason: string | null;
  staff: { id: string; user: { fullName: string; avatarUrl: string | null; phone: string | null } };
  services: Array<{
    serviceId: string;
    serviceName: string;
    price: string | number;
    durationMinutes: number;
  }>;
  review: { id: string; rating: number; comment: string | null } | null;
}
export interface Availability {
  date: string;
  totalDurationMinutes: number;
  totalPrice: number;
  slots: Array<{ startAt: string; endAt: string; availableStaffIds: string[] }>;
}
export interface ProfileUser extends User {
  customerProfile?: {
    id: string;
    dateOfBirth: string | null;
    loyaltyPoint: number;
    notes: string | null;
  };
}
