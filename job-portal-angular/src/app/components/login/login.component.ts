import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onLogin(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Please enter registered email and valid password';
      this.toastr.warning('Please enter registered email and valid password');
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toastr.success('Login successful');

        const pendingJobId = localStorage.getItem('pendingJobId');

        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (pendingJobId) {
          this.router.navigate(['/user'], {
            queryParams: { applyJobId: pendingJobId }
          });
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Invalid email or password';
        this.toastr.error('Enter registered email and valid password');
      }
    });
  }
}