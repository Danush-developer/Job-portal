import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  
  // Using Signals for Zoneless Change Detection
  step = signal<number>(1); 
  loading = signal<boolean>(false);
  message = signal<string>('');
  error = signal<string>('');

  constructor(private authService: AuthService, private router: Router) {}

  sendOTP() {
    if (!this.email) {
      this.error.set('Please enter your email');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    console.log('Sending OTP request for:', this.email);

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        console.log('OTP sent successfully:', res);
        this.message.set('6-digit OTP has been sent to your email');
        this.loading.set(false);
        this.step.set(2); // This will now trigger the UI update!
      },
      error: (err) => {
        console.error('OTP request failed:', err);
        this.error.set(err.error?.error || 'User not found or Server Error');
        this.loading.set(false);
      }
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    this.authService.resetPassword({
      token: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.message.set('Password changed successfully!');
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Invalid OTP Code');
        this.loading.set(false);
      }
    });
  }
}
