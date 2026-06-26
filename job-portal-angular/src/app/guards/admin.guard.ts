import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (!user || !user.role) {
    // Not logged in — redirect to login
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'ADMIN') {
    // Logged in but not admin — redirect to user dashboard
    router.navigate(['/user']);
    return false;
  }

  return true;
};
