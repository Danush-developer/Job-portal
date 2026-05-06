import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  jobs: any[] = [];
  applications: any[] = [];
  filteredApplications: any[] = [];
  talentPool: any[] = [];
  filteredTalent: any[] = [];
  view: 'listings' | 'post-job' | 'candidates' | 'analytics' | 'talent' = 'listings';
  stats: any = { totalJobs: 0, totalApplications: 0, totalEmployees: 0 };
  jobApplicantCounts: { [key: string]: number } = {};
  currentFilterTitle: string = '';
  currentJobId: string | null = null;
  currentJobTitle: string | null = null;

  editingJob: any = null;
  jobForm = {
    title: '', description: '', company: '', location: '',
    jobType: 'Full-time', experienceLevel: '', salary: '',
    requiredSkills: '', postedBy: ''
  };

  // Interview Modal State
  showInterviewModal = false;
  selectedAppForInterview: any = null;
  interviewForm = {
    date: '',
    link: ''
  };

  // Analytics computed data
  analyticsData = {
    statusColors: {
      'PENDING': '#6366f1',
      'SHORTLISTED': '#10b981',
      'HIRED': '#8b5cf6',
      'REJECTED': '#ef4444',
      'INTERVIEW': '#f59e0b'
    } as any,
    jobTypeCounts: [] as {label: string, count: number, color: string}[],
    statusCounts: [] as {label: string, count: number, color: string}[]
  };

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.refreshAllData();
    this.loadStats();
  }

  refreshAllData() {
    console.log('ULTIMATE RECOVERY: Starting sync...');
    forkJoin({
      jobs: this.jobService.getAllJobs(),
      apps: this.applicationService.getAllApplications(),
      talent: this.employeeService.getAllEmployees()
    }).subscribe({
      next: (result: any) => {
        // Robust extraction: Handle ApiResponse object OR direct array
        const jobsRes = result.jobs;
        const appsRes = result.apps;
        const talentRes = result.talent;
        
        // Filter out ghost jobs (those with no title)
        const rawJobs = jobsRes?.data || (Array.isArray(jobsRes) ? jobsRes : []);
        this.jobs = rawJobs.filter((j: any) => j.title && j.title.trim().length > 0);
        
        this.applications = appsRes?.data || (Array.isArray(appsRes) ? appsRes : []);
        this.filteredApplications = [...this.applications];
        
        this.talentPool = talentRes?.data || (Array.isArray(talentRes) ? talentRes : []);
        this.filteredTalent = [...this.talentPool];

        console.log('ULTIMATE RECOVERY: Sync Result', { 
          jobsCount: this.jobs.length, 
          appsCount: this.applications.length,
          talentCount: this.talentPool.length
        });
        
        if (this.applications.length === 0 && this.jobs.length > 0) {
          console.warn('RESCUE REQUIRED: No candidates found. Triggering diagnostic scanner...');
          this.http.get<any>(`${environment.apiUrl}/applications/diagnostic/rescue`).subscribe({
            next: (map: any) => console.log('RESCUE DIAGNOSTIC: Collection Map', JSON.stringify(map)),
            error: (err: any) => console.error('RESCUE ERROR:', err)
          });
        }
        
        this.calculateApplicantCounts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ULTIMATE RECOVERY: Connection Error!', err);
      }
    });
  }

  loadTalentPool() {
    this.employeeService.getAllEmployees().subscribe({
      next: (res: any) => {
        this.talentPool = res.data || (Array.isArray(res) ? res : []);
        this.filteredTalent = [...this.talentPool];
        this.cdr.detectChanges();
      }
    });
  }

  filterTalent(searchTerm: string) {
    if (!searchTerm) {
      this.filteredTalent = [...this.talentPool];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredTalent = this.talentPool.filter(t => 
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.email && t.email.toLowerCase().includes(term)) ||
        (t.skills && t.skills.toLowerCase().includes(term))
      );
    }
    this.cdr.detectChanges();
  }

  deleteTalent(id: string) {
    if (confirm('Delete this user profile?')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.talentPool = this.talentPool.filter(t => (t.id || t._id) !== id);
        this.filteredTalent = this.filteredTalent.filter(t => (t.id || t._id) !== id);
        this.cdr.detectChanges();
        this.refreshAllData();
      });
    }
  }

  calculateApplicantCounts() {
    this.jobApplicantCounts = {};
    if (!this.applications || !this.jobs) return;

    this.jobs.forEach(job => {
      const jobId = String(job.id || job._id || '');
      const jobTitle = String(job.title || '').toLowerCase().trim();
      
      const actualCount = this.applications.filter(app => {
        const appJobId = String(app.jobId || '');
        const appJobTitle = String(app.jobTitle || '').toLowerCase().trim();
        
        // Strict matching: ID is preferred. Title fallback only for legacy data without IDs.
        if (jobId && appJobId) {
          return jobId === appJobId;
        }
        return jobTitle && appJobTitle && (jobTitle === appJobTitle);
      }).length;

      // Map primarily by ID to ensure accuracy
      if (jobId) this.jobApplicantCounts[jobId] = actualCount;
      
      // Also map by title ONLY if no other job with this ID exists (legacy support)
      if (jobTitle && !this.jobApplicantCounts[jobTitle]) {
        this.jobApplicantCounts[jobTitle] = actualCount;
      }
    });
    console.log('SYNC COMPLETE: Applicant counts verified against current candidate list.');
  }

  getJobCount(job: any): number {
    if (!job) return 0;
    const id = String(job.id || job._id || '');
    const title = String(job.title || '').toLowerCase().trim();
    return this.jobApplicantCounts[id] || this.jobApplicantCounts[title] || 0;
  }

  viewResume(appId: string) {
    if (!appId) {
      alert('Application ID is missing.');
      return;
    }
    this.applicationService.downloadResume(appId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => alert('Failed to view resume (maybe not uploaded)')
    });
  }

  loadStats() {
    this.applicationService.getStats().subscribe({
      next: (res: any) => {
        this.stats = res.data || res;
        this.prepareAnalytics();
        this.cdr.detectChanges();
      }
    });
  }

  prepareAnalytics() {
    // 1. Prepare Status Distribution (calculate from local applications for accuracy)
    const statusMap = new Map<string, number>();
    this.applications.forEach(app => {
      const status = app.status || 'PENDING';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    this.analyticsData.statusCounts = Array.from(statusMap.entries()).map(([label, count]) => ({
      label,
      count,
      color: this.analyticsData.statusColors[label] || '#94a3b8'
    }));

    // 2. Prepare Job Type Distribution (from local jobs list)
    const typeMap = new Map<string, number>();
    this.jobs.forEach(job => {
      const type = job.jobType || 'Full-time';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    this.analyticsData.jobTypeCounts = Array.from(typeMap.entries()).map(([label, count], i) => ({
      label,
      count,
      color: colors[i % colors.length]
    }));
  }

  getPieStyle(data: any[]) {
    let currentPercentage = 0;
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    if (total === 0) return 'conic-gradient(#f1f5f9 0% 100%)';
    
    const gradients = data.map(item => {
      const start = currentPercentage;
      const end = start + (item.count / total * 100);
      currentPercentage = end;
      return `${item.color} ${start}% ${end}%`;
    });
    
    return `conic-gradient(${gradients.join(', ')})`;
  }

  viewJobApplications(jobId: string, jobTitle: string) {
    this.view = 'candidates';
    this.currentJobId = jobId;
    this.currentJobTitle = jobTitle;
    this.currentFilterTitle = `Applicants for: ${jobTitle}`;
    const cleanTitle = jobTitle.toLowerCase().trim();
    
    // FETCH DIRECTLY FROM BACKEND for maximum reliability
    this.applicationService.getApplicationsByJob(jobId).subscribe({
      next: (res: any) => {
        let results = res.data || (Array.isArray(res) ? res : []);
        
        // If no results by ID from backend, try local fallback from the already loaded applications list
        if (results.length === 0) {
          console.warn('No applications found by JobID from backend, trying local matching...');
          results = this.applications.filter(app => {
            const appJobId = String(app.jobId || '');
            const appJobTitle = String(app.jobTitle || '').toLowerCase().trim();
            
            const idMatch = jobId && appJobId && (jobId === appJobId);
            const titleMatch = cleanTitle && appJobTitle && (cleanTitle === appJobTitle);
            
            return idMatch || titleMatch;
          });
        }
        
        // Update master list with new data to keep search working
        const existingIds = new Set(this.applications.map(a => a.id || a._id));
        results.forEach((newApp: any) => {
          if (!existingIds.has(newApp.id || newApp._id)) {
            this.applications.push(newApp);
          }
        });

        this.filteredApplications = results;
        this.cdr.detectChanges();
        console.log(`Loaded ${this.filteredApplications.length} specific applicants for ${jobTitle}`);
      },
      error: (err) => {
        console.error('Error fetching job-specific applications', err);
        // Fallback to local filter if API fails
        this.filteredApplications = this.applications.filter(app => 
          String(app.jobId) === String(jobId) || 
          (app.jobTitle && app.jobTitle.toLowerCase().trim() === cleanTitle)
        );
        this.cdr.detectChanges();
      }
    });
  }

  clearFilter() {
    this.currentFilterTitle = '';
    this.currentJobId = null;
    this.currentJobTitle = null;
    this.filteredApplications = [...this.applications];
    this.cdr.detectChanges();
  }

  filterApplications(searchTerm: string) {
    // 1. Determine the base list for search
    // If we are in a job-specific view, search within those results.
    // Otherwise, search the master applications list.
    let baseList = (this.currentJobId || this.currentJobTitle) 
      ? [...this.filteredApplications] 
      : [...this.applications];
    
    // Recovery: if master list is empty but we have filtered results, use them
    if (baseList.length === 0 && this.filteredApplications.length > 0) {
      baseList = [...this.filteredApplications];
    }

    // 2. Apply the search term filter
    if (!searchTerm) {
      // Restore the context-appropriate base list
      if (this.currentJobId || this.currentJobTitle) {
        const cleanTitle = this.currentJobTitle?.toLowerCase().trim();
        this.filteredApplications = this.applications.filter(app => 
          String(app.jobId) === String(this.currentJobId) || 
          (app.jobTitle && app.jobTitle.toLowerCase().trim() === cleanTitle)
        );
      } else {
        this.filteredApplications = [...this.applications];
      }
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredApplications = baseList.filter(app => 
        (app.employeeName && app.employeeName.toLowerCase().includes(term)) ||
        (app.jobTitle && app.jobTitle.toLowerCase().includes(term)) ||
        (app.employeeEmail && app.employeeEmail.toLowerCase().includes(term))
      );
    }
    this.cdr.detectChanges();
  }

  onSubmitJob() {
    if (this.editingJob) {
      this.jobService.updateJob(this.editingJob.id || this.editingJob._id, this.jobForm).subscribe(() => {
        this.refreshAllData();
        this.resetForm();
      });
    } else {
      this.jobService.createJob(this.jobForm).subscribe(() => {
        this.refreshAllData();
        this.resetForm();
      });
    }
  }

  editJob(job: any) {
    this.editingJob = job;
    this.jobForm = { ...job };
    this.view = 'post-job';
  }

  deleteJob(id: string) {
    if (confirm('Delete this job listing?')) {
      this.jobService.deleteJob(id).subscribe(() => this.refreshAllData());
    }
  }

  deleteApplication(id: string) {
    if (confirm('Permanently delete this application?')) {
      this.applicationService.deleteApplication(id).subscribe(() => {
        // Instant UI Removal for premium feel
        this.applications = this.applications.filter(app => (app.id || app._id) !== id);
        this.filteredApplications = this.filteredApplications.filter(app => (app.id || app._id) !== id);
        this.calculateApplicantCounts();
        this.cdr.detectChanges();
        
        // Background sync to ensure data integrity
        this.refreshAllData();
        this.loadStats();
      });
    }
  }

  updateAppStatus(appId: string, status: string) {
    if (!status) return;

    if (status === 'INTERVIEW') {
      const app = this.applications.find(a => (a.id || a._id) === appId);
      this.openInterviewModal(app);
      return;
    }

    if (status === 'REJECTED') {
      const reason = prompt('Please enter the reason for rejection:');
      if (!reason) return;
      this.applicationService.rejectApplication(appId, reason).subscribe(() => {
        this.handleStatusUpdate(appId, status);
      });
      return;
    }

    this.applicationService.updateStatus(appId, status).subscribe(() => {
      this.handleStatusUpdate(appId, status);
    });
  }

  handleStatusUpdate(appId: string, status: string) {
    // Instant UI Update
    const app = this.applications.find(a => (a.id || a._id) === appId);
    if (app) app.status = status;
    
    const fApp = this.filteredApplications.find(a => (a.id || a._id) === appId);
    if (fApp) fApp.status = status;
    
    this.cdr.detectChanges();
    this.refreshAllData();
  }

  openInterviewModal(app: any) {
    this.selectedAppForInterview = app;
    this.showInterviewModal = true;
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    this.interviewForm.date = tomorrow.toISOString().slice(0, 16);
    this.interviewForm.link = 'https://meet.google.com/new';
  }

  closeInterviewModal() {
    this.showInterviewModal = false;
    this.selectedAppForInterview = null;
  }

  submitInterviewSchedule() {
    if (!this.selectedAppForInterview || !this.interviewForm.date) return;

    const appId = this.selectedAppForInterview.id || this.selectedAppForInterview._id;
    this.applicationService.scheduleInterview(
      appId,
      this.interviewForm.date,
      this.interviewForm.link
    ).subscribe({
      next: () => {
        this.handleStatusUpdate(appId, 'INTERVIEW');
        this.closeInterviewModal();
      },
      error: (err) => {
        console.error('Error scheduling interview:', err);
        const errorMsg = err.error?.message || 'Failed to schedule interview. Please check the date format and try again.';
        alert(errorMsg);
      }
    });
  }

  getPendingCount(): number {
    return this.applications.filter(app => app.status === 'PENDING').length;
  }

  resetForm() {
    this.editingJob = null;
    this.jobForm = {
      title: '', description: '', company: '', location: '',
      jobType: 'Full-time', experienceLevel: '', salary: '',
      requiredSkills: '', postedBy: ''
    };
    this.view = 'listings';
  }

  loadJobs() { this.refreshAllData(); }
  loadAllApplications() { this.refreshAllData(); }

  getStatusCountForJob(job: any, status: string): number {
    if (!this.applications || !job) return 0;
    const jobId = String(job.id || job._id || '');
    const jobTitle = String(job.title || '').toLowerCase().trim();

    return this.applications.filter(app => {
      const appJobId = String(app.jobId || '');
      const appJobTitle = String(app.jobTitle || '').toLowerCase().trim();
      const idMatch = jobId && appJobId && (jobId === appJobId);
      const titleMatch = jobTitle && appJobTitle && (jobTitle === appJobTitle);
      
      if (idMatch || titleMatch) {
        if (status === 'ANY') return true;
        return app.status === status;
      }
      return false;
    }).length;
  }
}
