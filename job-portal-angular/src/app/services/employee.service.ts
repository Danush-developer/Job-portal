import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getProfileByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  updateProfile(id: string, profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, profile);
  }

  createProfile(profile: any): Observable<any> {
    return this.http.post(this.apiUrl, profile);
  }

  getAllEmployees(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
