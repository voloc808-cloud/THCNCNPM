import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';
let refreshing = false;
const refreshed$ = new BehaviorSubject<string | null>(null);
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(TokenStorageService),
    auth = inject(AuthService),
    router = inject(Router);
  const withToken = (token: string | null) =>
    token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(withToken(storage.accessToken)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        request.url.includes('/auth/login') ||
        request.url.includes('/auth/register') ||
        request.url.includes('/auth/refresh')
      )
        return throwError(() => error);
      const refreshToken = storage.refreshToken;
      if (!refreshToken) {
        auth.clearSession();
        void router.navigate(['/login']);
        return throwError(() => error);
      }
      if (!refreshing) {
        refreshing = true;
        refreshed$.next(null);
        return auth.refresh().pipe(
          switchMap(({ data }) => {
            refreshed$.next(data.accessToken);
            return next(withToken(data.accessToken));
          }),
          catchError((refreshError) => {
            auth.clearSession();
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
          finalize(() => (refreshing = false)),
        );
      }
      return refreshed$.pipe(
        filter((token): token is string => !!token),
        take(1),
        switchMap((token) => next(withToken(token))),
      );
    }),
  );
};
