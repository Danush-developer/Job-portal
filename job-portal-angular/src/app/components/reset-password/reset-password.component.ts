

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  data = {
    token: '',
    newPassword: '',
    confirmPassword: ''
  };
  loading: boolean = false;
  message: string = '';
  error: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Automatically read token from URL: ?token=XYZ
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.data.token = params['token'];
      }
    });
  }

  onSubmit() {
    if (this.data.newPassword !== this.data.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    this.authService.resetPassword({
      token: this.data.token,
      newPassword: this.data.newPassword
    }).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error.error || 'Failed to reset password';
        this.loading = false;
      }
    });
  }
}
