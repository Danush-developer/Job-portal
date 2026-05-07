import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<any>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({
          userId: res.userId,
          role: res.role,
          name: (res.name && res.name !== 'User') ? res.name : (res.email ? res.email.split('@')[0] : 'Admin'),
          email: res.email
        }));
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.clear(); // Hard reset of all local data
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return this.currentUser()?.role;
  }

  getUserId() {
    return this.currentUser()?.userId;
  }

  getName() {
    return this.currentUser()?.name;
  }

  refreshNameFromProfile(userId: string): Observable<string> {
    return this.http.get<any>(`${environment.apiUrl}/employees/user/${userId}`).pipe(
      map((res: any) => {
        const data = res.data || res;
        if (data && data.name) {
          const user = { ...this.currentUser(), name: data.name };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
          return data.name;
        }
        return '';
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  private getUserFromStorage() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return (user && token && token !== 'null' && token !== 'undefined') ? JSON.parse(user) : null;
  }
}
