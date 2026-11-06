import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Role } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
export const roleGuard =
  (roles: Role[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService),
      router = inject(Router);
    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    return auth.hasRole(roles) ? true : router.createUrlTree(['/khong-co-quyen']);
  };
