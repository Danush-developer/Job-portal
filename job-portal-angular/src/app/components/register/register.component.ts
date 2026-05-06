import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', role: 'USER' };
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.loading = true;
    this.authService.register(this.user).subscribe({
      next: () => {
        // Automatically login after registration
        this.authService.login({ email: this.user.email, password: this.user.password }).subscribe({
          next: (res) => {
            const pendingJobId = localStorage.getItem('pendingJobId');
            if (res.role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (pendingJobId) {
              this.router.navigate(['/user'], { queryParams: { applyJobId: pendingJobId } });
            } else {
              this.router.navigate(['/user']);
            }
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
