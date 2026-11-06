import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { ApiResponse, AuthPayload, Role, User } from './auth.models';
import { TokenStorageService } from './token-storage.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);
  private readonly userState = signal<User | null>(this.storage.user);
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userState());
  readonly role = computed(() => this.userState()?.role ?? null);
  googleConfig() {
    return this.http.get<ApiResponse<{ clientId: string }>>('/api/v1/auth/google/config');
  }
  loginWithGoogle(credential: string) {
    return this.http
      .post<ApiResponse<AuthPayload>>('/api/v1/auth/google', { credential })
      .pipe(tap(({ data }) => this.setSession(data)));
  }
  login(input: { email: string; password: string }) {
    return this.http
      .post<ApiResponse<AuthPayload>>('/api/v1/auth/login', input)
      .pipe(tap(({ data }) => this.setSession(data)));
  }
  register(input: { email: string; password: string; fullName: string; phone?: string }) {
    return this.http
      .post<ApiResponse<AuthPayload>>('/api/v1/auth/register', input)
      .pipe(tap(({ data }) => this.setSession(data)));
  }
  refresh(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/api/v1/auth/refresh', {
        refreshToken: this.storage.refreshToken,
      })
      .pipe(tap(({ data }) => this.storage.saveTokens(data.accessToken, data.refreshToken)));
  }
  loadProfile() {
    return this.http.get<ApiResponse<User>>('/api/v1/auth/me').pipe(
      tap(({ data }) => {
        this.storage.saveUser(data);
        this.userState.set(data);
      }),
    );
  }
  logout() {
    const refreshToken = this.storage.refreshToken;
    this.clearSession();
    if (!refreshToken) return;
    this.http.post('/api/v1/auth/logout', { refreshToken }).subscribe({ error: () => undefined });
  }
  hasRole(roles: Role[]) {
    const role = this.role();
    return !!role && roles.includes(role);
  }
  homeForRole(role: Role | null = this.role()) {
    return role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/staff-portal' : '/customer';
  }
  clearSession() {
    this.storage.clear();
    this.userState.set(null);
  }
  private setSession(payload: AuthPayload) {
    this.storage.save(payload);
    this.userState.set(payload.user);
  }
}
