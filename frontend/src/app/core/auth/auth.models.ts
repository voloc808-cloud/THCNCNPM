export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  customerProfile?: unknown;
  staffProfile?: unknown;
}
export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
}
export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: Array<{ path: PropertyKey[]; message: string }>;
}
