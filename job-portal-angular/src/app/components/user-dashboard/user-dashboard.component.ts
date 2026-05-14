import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  jobs: any[] = [];
  myApplications: any[] = [];
  view: 'jobs' | 'my-apps' | 'apply' | 'profile' | 'account' = 'jobs';
  searchTerm: string = '';
  filteredJobs: any[] = [];
  shortlistedCount: number = 0;
  isPublicView: boolean = false;
  
  userProfile: any = {
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    education: '',
    designation: '',
    bio: ''
  };
  
  selectedJob: any = null;
  applicationForm = {
    employeeName: '',
    employeeEmail: '',
    phone: '',
    resume: '',
    skills: '',
    experience: '',
    education: '',
    bio: ''
  };

  selectedFile: File | null = null;
  isUploading: boolean = false;

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    public authService: AuthService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadJobs();
    this.loadMyApplications();
    this.loadUserProfile();
    this.checkPublicView();
    this.checkPendingApplication();
  }

  checkPublicView() {
    this.route.queryParams.subscribe(params => {
      this.isPublicView = params['public'] === 'true';
      if (this.isPublicView) {
        this.view = 'jobs';
      }
    });
  }

  checkPendingApplication() {
    this.route.queryParams.subscribe((params: any) => {
      const applyJobId = params['applyJobId'];
      if (applyJobId) {
        // Wait for jobs to be loaded
        const checkJobs = setInterval(() => {
          if (this.jobs.length > 0) {
            const job = this.jobs.find(j => j.id === applyJobId);
            if (job) {
              this.openApplyForm(job);
              // Clean up localStorage and URL
              localStorage.removeItem('pendingJobId');
              localStorage.removeItem('pendingJobTitle');
              clearInterval(checkJobs);
            }
          }
        }, 500);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkJobs), 5000);
      }
    });
  }

  hasApplied(jobId: string): boolean {
    return this.myApplications.some(app => app.jobId === jobId);
  }

  loadJobs() {
    this.jobService.getAllJobs().subscribe({
      next: (res: any) => {
        const rawJobs = res.data || (Array.isArray(res) ? res : []);
        // Filter out empty cards (ghost jobs with no title or ID)
        this.jobs = rawJobs.filter((j: any) => j && (j.id || j._id) && j.title && j.title.trim().length > 0);
        this.filteredJobs = [...this.jobs];
        this.cdr.detectChanges();
      },
      error: () => console.error('Failed to load jobs')
    });
  }

  filterJobs() {
    if (!this.searchTerm) {
      this.filteredJobs = [...this.jobs];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredJobs = this.jobs.filter(job => 
        job.title?.toLowerCase().includes(term) || 
        job.company?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  loadMyApplications() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.applicationService.getApplicationsByEmployee(userId).subscribe((res: any) => {
      this.myApplications = res.data || (Array.isArray(res) ? res : []);
      this.shortlistedCount = this.myApplications.filter(app => app.status === 'SHORTLISTED').length;
      this.cdr.detectChanges();
    });
  }

  loadUserProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.log('User ID not available yet');
      return;
    }

    this.employeeService.getProfileByUserId(userId).subscribe({
      next: (res: any) => {
        // Correctly extract data from ApiResponse
        if (res && res.data) {
          this.userProfile = res.data;
        } else if (res && !res.success && res.message === 'User profile fetched') {
          // Case where data is null but it's a success response from backend
          // Keep default profile but ensure userId is set
          this.userProfile.userId = userId;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Profile not found or error fetching profile:', err);
        // Ensure userId is set for creation even if fetch fails
        this.userProfile.userId = userId;
      }
    });
  }

  onUpdateProfile() {
    if (!this.userProfile) {
      alert('Profile data is missing');
      return;
    }

    if (this.userProfile.id) {
      this.employeeService.updateProfile(this.userProfile.id, this.userProfile).subscribe({
        next: (res: any) => {
          this.userProfile = res.data || res;
          alert('Profile updated successfully!');
        },
        error: () => alert('Failed to update profile')
      });
    } else {
      const userId = this.authService.getUserId();
      this.userProfile.userId = userId;
      this.employeeService.createProfile(this.userProfile).subscribe({
        next: (res: any) => {
          // Fix: use res.data instead of res.employee
          this.userProfile = res.data || res.employee || res;
          alert('Profile created successfully!');
          this.cdr.detectChanges();
        },
        error: () => alert('Failed to create profile')
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  openApplyForm(job: any) {
    const userId = this.authService.getUserId();
    if (!userId) {
      // Store intent and redirect to login
      localStorage.setItem('pendingJobId', job.id || job._id);
      localStorage.setItem('pendingJobTitle', job.title);
      this.router.navigate(['/login']);
      return;
    }

    this.selectedJob = job;
    // Smart Pre-fill: Use profile data to fill the application form
    this.applicationForm = {
      employeeName: this.userProfile.name || '',
      employeeEmail: this.userProfile.email || '',
      phone: this.userProfile.phone || '',
      resume: '',
      skills: this.userProfile.skills || '',
      experience: this.userProfile.experience || '',
      education: this.userProfile.education || '',
      bio: this.userProfile.bio || ''
    };
    this.view = 'apply';
  }

  onSubmitApplication() {
    if (!this.selectedFile) {
      alert('Please upload your resume (PDF/Doc).');
      return;
    }

    this.isUploading = true;
    
    // Clean experience value
    const expValue = this.applicationForm.experience;
    const cleanExperience = typeof expValue === 'string' ? parseInt(expValue, 10) : expValue;

    const application = {
      ...this.applicationForm,
      experience: cleanExperience || 0,
      jobId: this.selectedJob.id,
      employeeId: this.authService.getUserId(),
      jobTitle: this.selectedJob.title
    };

    this.applicationService.applyWithResume(this.selectedFile, application).subscribe({
      next: () => {
        alert('Application submitted successfully!');
        this.isUploading = false;
        this.loadMyApplications();
        this.view = 'my-apps';
        this.resetForm();
        this.selectedFile = null;
      },
      error: (err: any) => {
        this.isUploading = false;
        alert(err.error?.message || 'Failed to submit application');
      }
    });
  }

  getCleanLink(link: string): string {
    if (!link) return '#';
    if (!link.includes('https://')) return link;
    
    // Extract the URL if it's embedded in a block of text
    const start = link.indexOf('https://');
    let end = link.indexOf(' ', start);
    if (end === -1) end = link.indexOf('\n', start);
    if (end === -1) end = link.length;
    
    return link.substring(start, end).trim();
  }

  resetForm() {
    this.applicationForm = {
      employeeName: '', employeeEmail: '', phone: '',
      resume: '', skills: '', experience: '', education: '', bio: ''
    };
  }

  calculateMatchScore(job: any): number {
    if (!this.userProfile || !job) return 0;
    
    let score = 0;
    const requiredSkills = (job.requiredSkills || '').toLowerCase().split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const userSkills = (this.userProfile.skills || '').toLowerCase().split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    if (requiredSkills.length > 0) {
      const matchedSkills = requiredSkills.filter((rs: string) => 
        userSkills.some((us: string) => us.includes(rs) || rs.includes(us))
      );
      score += (matchedSkills.length / requiredSkills.length) * 60;
    } else {
      score += 60;
    }

    const requiredExp = parseInt(job.experienceLevel) || 0;
    const userExp = parseInt(this.userProfile.experience) || 0;
    if (userExp >= requiredExp) {
      score += 40;
    } else if (userExp > 0) {
      score += (userExp / requiredExp) * 40;
    }

    return Math.round(Math.min(score, 100));
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }
}
