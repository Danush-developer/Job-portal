import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (!user) {
    // Not logged in — redirect to login
    router.navigate(['/login']);
    return false;
  }

  if (user.role === 'ADMIN') {
    // Admin users should not access the user dashboard — redirect to admin panel
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
