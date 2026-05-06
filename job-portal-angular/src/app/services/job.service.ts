import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getAllJobs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getJobById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getJobsByAdmin(adminId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/${adminId}`);
  }

  createJob(job: any): Observable<any> {
    return this.http.post(this.apiUrl, job);
  }

  updateJob(id: string, job: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
