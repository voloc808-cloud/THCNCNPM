import { Injectable } from '@angular/core';
import type { AuthPayload, User } from './auth.models';
const ACCESS = 'royal_barber_access';
const REFRESH = 'royal_barber_refresh';
const USER = 'royal_barber_user';
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  get accessToken() {
    return localStorage.getItem(ACCESS);
  }
  get refreshToken() {
    return localStorage.getItem(REFRESH);
  }
  get user(): User | null {
    const value = localStorage.getItem(USER);
    if (!value) return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      return null;
    }
  }
  save(payload: AuthPayload) {
    localStorage.setItem(ACCESS, payload.accessToken);
    localStorage.setItem(REFRESH, payload.refreshToken);
    localStorage.setItem(USER, JSON.stringify(payload.user));
  }
  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS, accessToken);
    localStorage.setItem(REFRESH, refreshToken);
  }
  saveUser(user: User) {
    localStorage.setItem(USER, JSON.stringify(user));
  }
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
  }
}
