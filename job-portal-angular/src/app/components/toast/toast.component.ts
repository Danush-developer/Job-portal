import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast animate-fade" [class]="toast.type">
          <i class="fas" [class.fa-bell]="toast.type==='info'" [class.fa-check-circle]="toast.type==='success'"></i>
          <div class="toast-content">{{ toast.message }}</div>
          <button (click)="removeToast(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      border-left: 4px solid var(--primary);
      backdrop-filter: blur(8px);
    }
    .toast-content { font-size: 14px; font-weight: 500; color: #1e293b; flex: 1; }
    button { background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; }
    .success { border-left-color: var(--success); }
    .info { border-left-color: var(--primary); }
  `]
})
export class ToastComponent implements OnInit {
  toasts: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.connect(userId);
      this.notificationService.notifications$.subscribe(msg => {
        this.addToast(msg);
      });
    }

    // Subscribe to manual toast messages
    this.toastService.toasts$.subscribe(toast => {
      this.addToast(toast.message, toast.type);
    });
  }

  addToast(message: string, type: string = 'info') {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
