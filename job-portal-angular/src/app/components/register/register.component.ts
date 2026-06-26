import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  user = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onRegister(form: NgForm): void {

    if (form.invalid) {
      this.error = 'Please enter valid details';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.user).subscribe({
      next: () => {

        this.toastr.success('Registration Successful');

        this.authService.login({
          email: this.user.email,
          password: this.user.password
        }).subscribe({
          next: (res: any) => {

            this.loading = false;

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
          error: () => {
            this.loading = false;
           this.toastr.error(
  'Email already exists',
  'Registration Failed'
);
          }
        });
      },

      error: (err: any) => {
        this.loading = false;

        if (
          err.error?.message?.toLowerCase().includes('email') ||
          err.error?.error?.toLowerCase().includes('email') ||
          err.error?.message?.toLowerCase().includes('exists') ||
          err.error?.error?.toLowerCase().includes('exists')
        ) {
          this.error = 'Email already exists';
          this.toastr.error('Email already exists');
        } else {
          this.error = err.error?.message || 'Registration failed';
          alert(this.error);
        }
      }
    });
  }
}