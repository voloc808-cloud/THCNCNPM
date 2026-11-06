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
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export interface AdminService {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}
export interface AdminStaff {
  id: string;
  bio: string | null;
  specialties: string | null;
  yearsOfExperience: number;
  isBookable: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    status: UserStatus;
  };
  services: Array<{ service: AdminService }>;
}
export interface AdminCustomer {
  id: string;
  dateOfBirth: string | null;
  loyaltyPoint: number;
  notes: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    status: UserStatus;
    createdAt: string;
  };
  _count: { appointments: number; reviews: number };
}
export interface AdminAppointment {
  id: string;
  code: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  totalPrice: string | number;
  totalDurationMinutes: number;
  customerNote: string | null;
  cancellationReason: string | null;
  customer: { id: string; user: { fullName: string; email: string; phone: string | null } };
  staff: { id: string; user: { fullName: string; email: string; phone: string | null } };
  services: Array<{
    serviceId: string;
    serviceName: string;
    price: string | number;
    durationMinutes: number;
  }>;
}
export interface StaffShift {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
export interface DayOff {
  id: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  staff: { id: string; user: { fullName: string; email: string } };
}
