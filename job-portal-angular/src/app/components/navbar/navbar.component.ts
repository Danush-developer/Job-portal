import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="top-navbar">
      <div class="app-container nav-content">
        <div class="brand" routerLink="/">
          <div class="brand-icon">SF</div>
          <div class="brand-text-group">
            <span class="brand-name">StepForwardx</span>
            <span class="brand-tagline">COMPETENT . COLLABORATIVE . CONSISTENT</span>
          </div>
        </div>
        
        <div class="nav-menu">
          <div class="menu-item" routerLink="/" fragment="company">Company <i class="fas fa-chevron-down"></i></div>
          <div class="menu-item" routerLink="/" fragment="services">Services <i class="fas fa-chevron-down"></i></div>
          <div class="menu-item" routerLink="/" fragment="products">Products <i class="fas fa-chevron-down"></i></div>
          <div class="menu-item" routerLink="/" fragment="whats-new">What's New <i class="fas fa-chevron-down"></i></div>
          <div class="menu-item" routerLink="/" fragment="careers">Careers</div>
          <div class="menu-item" routerLink="/" fragment="contact">Contact</div>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="!authService.currentUser()">
            <button class="btn btn-text" routerLink="/login">Log in</button>
            <button class="btn btn-primary" routerLink="/register">Get Started</button>
          </ng-container>

          <ng-container *ngIf="authService.currentUser()">
            <div class="nav-user-info">

              <div class="user-profile-circle">
                {{ (authService.getName() || authService.currentUser()?.email || authService.getRole())?.[0] || 'A' }}
              </div>
              <button class="btn btn-outline" (click)="logout()">Logout</button>
            </div>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .top-navbar {
      height: 90px;
      background: white;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 15px rgba(0,0,0,0.02);
    }
    .nav-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      background: #1e1b4b;
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
    }
    .brand-text-group {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1e1b4b;
      line-height: 1;
    }
    .brand-tagline {
      font-size: 0.6rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }
    
    .nav-menu {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    .menu-item {
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }
    .menu-item:hover { color: #4f46e5; }
    .menu-item i { font-size: 0.7rem; opacity: 0.5; }

    .nav-actions { display: flex; align-items: center; gap: 1rem; }
    .nav-user-info { display: flex; align-items: center; gap: 1rem; }
    
    .user-profile-circle {
      width: 38px;
      height: 38px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #4f46e5;
      font-size: 0.9rem;
    }



    .btn-text {
      background: transparent;
      border: none;
      color: #475569;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 1rem;
    }
    .btn-primary {
      background: #4f46e5;
      color: white;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #4338ca; }
  `]
})
export class NavbarComponent implements OnInit {
  constructor(
    public authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.authService.getToken() && this.authService.currentUser() && (!this.authService.getName() || this.authService.getName() === 'User')) {
      const userId = this.authService.getUserId();
      this.authService.refreshNameFromProfile(userId).subscribe({
        next: (name: string) => {
          if (name) this.cdr.detectChanges();
        }
      });
    }
    setTimeout(() => this.cdr.detectChanges(), 100);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
