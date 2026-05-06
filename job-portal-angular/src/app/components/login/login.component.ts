import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        const pendingJobId = localStorage.getItem('pendingJobId');
        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (pendingJobId) {
          this.router.navigate(['/user'], { queryParams: { applyJobId: pendingJobId } });
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}
