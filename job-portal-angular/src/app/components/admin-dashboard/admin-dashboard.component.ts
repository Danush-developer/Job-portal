import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { ContactService } from '../../services/contact.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { MyJobPostings } from './components/my-job-postings/my-job-postings';
import { PostNewJobs } from './components/post-new-jobs/post-new-jobs';
import { AllCandidates } from './components/all-candidates/all-candidates';
import { TalentPool } from './components/talent-pool/talent-pool';
import { Analytics } from './components/analytics/analytics';
import { SupportQueries } from './components/support-queries/support-queries';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MyJobPostings, PostNewJobs, AllCandidates, TalentPool, Analytics, SupportQueries],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {
  jobs: any[] = [];
  applications: any[] = [];
  filteredApplications: any[] = [];
  talentPool: any[] = [];
  filteredTalent: any[] = [];
  contactMessages: any[] = [];
  filteredMessages: any[] = [];
  view: 'listings' | 'post-job' | 'candidates' | 'analytics' | 'talent' | 'queries' = 'listings';
  stats: any = { totalJobs: 0, totalApplications: 0, totalEmployees: 0 };
  jobApplicantCounts: { [key: string]: number } = {};
  currentFilterTitle: string = '';
  currentJobId: string | null = null;
  currentJobTitle: string | null = null;
  isUpdating: string | null = null;
  isScreening: string | null = null;
  selectedAppForInsights: any = null;
  showAIModal: boolean = false;

  editingJob: any = null;
  jobForm = {
    title: '', description: '', company: '', location: '',
    jobType: 'Full-time', experienceLevel: '', salary: '',
    requiredSkills: '', postedBy: '',
    startDate: '', endDate: ''
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
    private contactService: ContactService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Restore view from localStorage if it exists
    const savedView = localStorage.getItem('adminView');
    if (savedView) {
      this.view = savedView as any;
    }
    this.refreshAllData();
    this.loadStats();
  }

  // Helper to switch view and persist it
  switchView(newView: any) {
    this.view = newView;
    localStorage.setItem('adminView', newView);
    if (newView === 'candidates' || newView === 'listings') {
      // Duplicate refreshAllData removed – kept single implementation above.
    }
  }

  refreshAllData() {
    console.log('ULTIMATE RECOVERY: Starting sync...');
    forkJoin({
      jobs: this.jobService.getAllJobs(),
      apps: this.applicationService.getAllApplications(),
      talent: this.employeeService.getAllEmployees(),
      messages: this.contactService.getAllMessages()
    }).subscribe({
      next: (result: any) => {
        const jobsRes = result.jobs;
        const appsRes = result.apps;
        const talentRes = result.talent;
        const messagesRes = result.messages;
        const rawJobs = jobsRes?.data || (Array.isArray(jobsRes) ? jobsRes : []);
        this.jobs = rawJobs.filter((j: any) => j.title && j.title.trim().length > 0);
        this.applications = appsRes?.data || (Array.isArray(appsRes) ? appsRes : []);
        // Enrich applications with job required skills
        this.enrichApplicationsWithJobSkills();
        this.filteredApplications = [...this.applications];
        this.talentPool = talentRes?.data || (Array.isArray(talentRes) ? talentRes : []);
        this.filteredTalent = [...this.talentPool];
        this.contactMessages = messagesRes?.data || (Array.isArray(messagesRes) ? messagesRes : []);
        this.filteredMessages = [...this.contactMessages];
        console.log('ULTIMATE RECOVERY: Sync Result', { 
          jobsCount: this.jobs.length, 
          appsCount: this.applications.length,
          talentCount: this.talentPool.length,
          messagesCount: this.contactMessages.length
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
    if (!id) {
      alert('Cannot delete: Employee ID is missing.');
      return;
    }
    if (confirm('Delete this user profile?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.talentPool = this.talentPool.filter(t => (t.id || t._id) !== id);
          this.filteredTalent = this.filteredTalent.filter(t => (t.id || t._id) !== id);
          this.cdr.detectChanges();
          this.refreshAllData();
          this.toastService.show('Employee profile deleted successfully.', 'success');
        },
        error: (err: any) => {
          console.error('Failed to delete employee:', err);
          alert('Failed to delete this profile. Please try again.');
        }
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

  getAppMatchScore(app: any): number {
    if (!app) return 0;
    const savedScore = this.toNumber(
      app.aiMatchScore ?? app.matchScore ?? app.ai_score ?? app.ai_match_score
    );
    if (savedScore !== null) {
      return Math.round(Math.max(0, Math.min(savedScore, 100)));
    }
    return this.calculateMatchScore(app);
  }

  private toNumber(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Simplified match score: only compare required skills with applicant's skills (100% weight)
  calculateMatchScore(app: any): number {
    // Directly compute skill match regardless of previous AI screening
    if (!app) return 0;

    const jobId = String(app.jobId || app.job_id || app.job?.id || app.job?._id || '');
    const jobTitle = String(app.jobTitle || app.job_title || app.job?.title || '').toLowerCase().trim();

    const job = this.jobs.find(j =>
      String(j.id || j._id) === jobId ||
      (j.title && jobTitle && j.title.toLowerCase().trim() === jobTitle)
    );

    const requiredSkillsSource = job?.requiredSkills || app.requiredSkills || app.required_skills || '';
    const requiredSkills = requiredSkillsSource.toLowerCase()
      .split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const applicantSkillsSource = app.skills || app.extractedSkills || app.extracted_skills || '';
    const applicantSkills = applicantSkillsSource.toLowerCase()
      .split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

    if (requiredSkills.length === 0) return 100;
    if (applicantSkills.length === 0) return 0;

    const matchedSkills = requiredSkills.filter((rs: string) =>
  applicantSkills.some((as: string) => as.includes(rs) || rs.includes(as))
);
    const score = (matchedSkills.length / requiredSkills.length) * 100;
    return Math.round(Math.min(score, 100));
  }

  getJobCount(job: any): number {
    if (!job) return 0;
    const id = String(job.id || job._id || '');
    const title = String(job.title || '').toLowerCase().trim();
    return this.jobApplicantCounts[id] || this.jobApplicantCounts[title] || 0;
  }

  getTotalActiveApplicants(): number {
    return this.jobs.reduce((total, job) => total + this.getJobCount(job), 0);
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
    // Format dates for datetime-local input if they exist
    if (this.jobForm.startDate) {
      this.jobForm.startDate = new Date(this.jobForm.startDate).toISOString().slice(0, 16);
    }
    if (this.jobForm.endDate) {
      this.jobForm.endDate = new Date(this.jobForm.endDate).toISOString().slice(0, 16);
    }
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

  // Handles UI updates after status changes
  handleStatusUpdate(appId: string, status: string) {
    // Update status in applications list
    const idx = this.applications.findIndex(a => (a.id || a._id) === appId);
    if (idx !== -1) {
      this.applications[idx].status = status;
    }
    // Update filtered list if present
    const fIdx = this.filteredApplications.findIndex(a => (a.id || a._id) === appId);
    if (fIdx !== -1) {
      this.filteredApplications[fIdx].status = status;
    }
    // Recalculate counts and trigger change detection
    this.calculateApplicantCounts();
    this.cdr.detectChanges();
    // Optional toast for user feedback
    if (this.toastService) {
      this.toastService.show('Application status updated.', 'success');
    }
  }

  // Wrapper for template compatibility – forwards to the main status updater
  updateAppStatus(appId: string, status: string) {
    if (status === 'INTERVIEW') {
      const app = this.applications.find(a => (a.id || a._id) === appId);
      if (app) {
        this.openInterviewModal(app);
      }
    } else if (status !== '') {
      this.applicationService.updateStatus(appId, status).subscribe({
        next: () => {
          this.handleStatusUpdate(appId, status);
        },
        error: (err) => {
          console.error('Failed to update status:', err);
          alert('Failed to update application status on server.');
        }
      });
    }
  }


  getRequiredSkills(app: any): string[] {
    if (!app) return [];
    // If the app already carries requiredSkills (populated after screening), use it
    const appRequiredSkills = app.requiredSkills || app.required_skills;
    if (appRequiredSkills) {
      return (appRequiredSkills || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    // Fallback: locate the job and extract its requiredSkills
    const jobId = String(app.jobId || app.job_id || app.job?.id || app.job?._id || '');
    const jobTitle = String(app.jobTitle || app.job_title || app.job?.title || '').toLowerCase().trim();
    const job = this.jobs.find(j =>
      String(j.id || j._id) === jobId ||
      (j.title && jobTitle && j.title.toLowerCase().trim() === jobTitle)
    );
    if (job && job.requiredSkills) {
      return (job.requiredSkills || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    return [];
  }

  /** Returns the job's required skills as a raw (original-case) array. */
  getJobRequiredSkills(app: any): string[] {
    if (!app) return [];
    const appRequiredSkills = app.requiredSkills || app.required_skills;
    if (appRequiredSkills) {
      return (appRequiredSkills as string)
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    const jobId = String(app.jobId || app.job_id || app.job?.id || app.job?._id || '');
    const jobTitle = String(app.jobTitle || app.job_title || app.job?.title || '').toLowerCase().trim();
    const job = this.jobs.find(j =>
      String(j.id || j._id) === jobId ||
      (j.title && jobTitle &&
        j.title.toLowerCase().trim() === jobTitle)
    );
    if (!job || !job.requiredSkills) return [];
    return (job.requiredSkills as string)
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  /** Returns which required skills are present in the applicant's self-reported skills (lowercase). */
  getComputedMatchedSkills(app: any): string[] {
    if (!app) return [];
    const required = this.getJobRequiredSkills(app).map((s: string) => s.toLowerCase());
    const applicant = (app.skills || '')
      .toLowerCase()
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    return required.filter((rs: string) =>
      applicant.some((as: string) => as.includes(rs) || rs.includes(as))
    );
  }

  /** Returns which required skills are MISSING from the applicant's self-reported skills (original case). */
  getComputedMissingSkills(app: any): string[] {
    if (!app) return [];
    const matched = this.getComputedMatchedSkills(app);
    return this.getJobRequiredSkills(app).filter(
      (s: string) => !matched.includes(s.toLowerCase())
    );
  }

  // After loading all data, enrich applications with requiredSkills for easier UI rendering
  enrichApplicationsWithJobSkills() {
    this.applications.forEach(app => {
      if (!app.requiredSkills) {
        const skills = this.getRequiredSkills(app);
        if (skills.length) {
          app.requiredSkills = skills.join(', ');
        }
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  screenApplication(app: any) {
    if (!app) return;
    const appId = app.id || app._id;
    if (!appId) {
      this.toastService.show('Application ID is missing.', 'error');
      return;
    }
    if (this.isScreening) return;
    this.isScreening = appId;
    this.applicationService.screenApplication(appId).subscribe({
      next: (res: any) => {
        this.isScreening = null;
        const updatedApp = res?.data || res;
        if (updatedApp) {
          this.toastService.show('AI Screening completed successfully!', 'success');
          
          const idx = this.applications.findIndex(a => (a.id || a._id) === appId);
          if (idx !== -1) {
            this.applications[idx] = updatedApp;
          }
          const fIdx = this.filteredApplications.findIndex(a => (a.id || a._id) === appId);
          if (fIdx !== -1) {
            this.filteredApplications[fIdx] = updatedApp;
          }
          
          if (this.selectedAppForInsights && (this.selectedAppForInsights.id || this.selectedAppForInsights._id) === appId) {
            this.selectedAppForInsights = updatedApp;
          }
          
          this.refreshAllData();
        } else {
          this.toastService.show('AI Screening finished but returned no data.', 'warning');
          this.refreshAllData();
        }
      },
      error: (err: any) => {
        this.isScreening = null;
        console.error('AI Screening failed:', err);
        this.toastService.show('AI Screening failed. Please ensure your API key is configured.', 'error');
      }
    });
  }

  viewAIInsights(app: any) {
    this.selectedAppForInsights = app;
    this.showAIModal = true;
  }

  closeAIInsights() {
    this.showAIModal = false;
    this.selectedAppForInsights = null;
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
    console.log('DEBUG: Submitting interview schedule...', this.interviewForm);
    if (!this.selectedAppForInterview || !this.interviewForm.date) {
      console.warn('DEBUG: Submission blocked - missing data', { 
        app: this.selectedAppForInterview, 
        date: this.interviewForm.date 
      });
      return;
    }

    const appId = this.selectedAppForInterview.id || this.selectedAppForInterview._id;
    this.applicationService.scheduleInterview(
      appId,
      this.interviewForm.date,
      this.interviewForm.link
    ).subscribe({
      next: (res) => {
        console.log('DEBUG: Interview scheduled successfully!', res);
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
      requiredSkills: '', postedBy: '',
      startDate: '', endDate: ''
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

  loadContactMessages() {
    this.contactService.getAllMessages().subscribe({
      next: (res: any) => {
        this.contactMessages = res.data || (Array.isArray(res) ? res : []);
        this.filteredMessages = [...this.contactMessages];
        this.cdr.detectChanges();
      }
    });
  }

  filterMessages(searchTerm: string) {
    if (!searchTerm) {
      this.filteredMessages = [...this.contactMessages];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredMessages = this.contactMessages.filter((m: any) => 
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        (m.message && m.message.toLowerCase().includes(term))
      );
    }
    this.cdr.detectChanges();
  }

  deleteMessage(id: string) {
    if (confirm('Delete this message?')) {
      this.contactService.deleteMessage(id).subscribe(() => {
        this.contactMessages = this.contactMessages.filter(m => (m.id || m._id) !== id);
        this.filteredMessages = this.filteredMessages.filter(m => (m.id || m._id) !== id);
        this.cdr.detectChanges();
      });
    }
  }

  updateMessageStatus(id: string, status: string) {
    this.contactService.updateStatus(id, status).subscribe((updated: any) => {
      const msg = this.contactMessages.find((m: any) => (m.id || m._id) === id);
      if (msg) msg.status = status;
      this.cdr.detectChanges();
    });
  }
}
