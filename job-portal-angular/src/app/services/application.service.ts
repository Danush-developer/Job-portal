import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForJob(application: any): Observable<any> {
    return this.http.post(this.apiUrl, application);
  }

  applyWithResume(file: File, application: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('application', JSON.stringify(application));
    return this.http.post(`${this.apiUrl}/apply-with-resume`, formData);
  }

  downloadResume(applicationId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${applicationId}`, { responseType: 'blob' });
  }

  getAllApplications(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getEmployeeProfile(employeeId: string): Observable<any> {
    // Note: We use the employees API but through the application service context for convenience in merging
    return this.http.get<any>(`${environment.apiUrl}/employees/user/${employeeId}`);
  }

  getApplicationsByEmployee(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getApplicationsByJob(jobId: string): Observable<any> {
    const url = `${this.apiUrl}/job/${jobId}`;
    console.log('API CALL: Fetching applications for job:', url);
    return this.http.get<any>(url);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  rejectApplication(id: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, { reason });
  }

  scheduleInterview(id: string, interviewDate: string, meetingLink: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/schedule-interview`;
    console.log('DEBUG: Calling Interview API:', url, { interviewDate, meetingLink });
    return this.http.put(url, { interviewDate, meetingLink });
  }

  deleteApplication(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  screenApplication(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/screen`, {});
  }
}
