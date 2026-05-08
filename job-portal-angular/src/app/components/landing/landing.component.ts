import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  currentSlide = 0;
  jobs: any[] = [];
  slides = [
    {
      title: 'Cloud Transformation',
      subtitle: 'Modernize your infrastructure with secure, scalable cloud solutions designed for the future.',
      image: 'images/slide1.png',
      bgColor: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)'
    },
    {
      title: 'Future of Work',
      subtitle: 'Empowering diverse teams with intelligent tools and collaborative digital ecosystems.',
      image: 'images/slide2.png',
      bgColor: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
    },
    {
      title: 'Digital Excellence',
      subtitle: 'Driving business value through innovative technology and strategic consulting.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200',
      bgColor: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)'
    }
  ];

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  showApplyModal = false;
  selectedJob: any = null;
  applicationForm = {
    employeeName: '',
    employeeEmail: '',
    phone: '',
    experience: '',
    skills: '',
    education: ''
  };
  resumeFile: File | null = null;

  constructor(
    private jobService: JobService, 
    private applicationService: ApplicationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadJobs();
    // Auto-rotate slides every 5 seconds
    setInterval(() => this.nextSlide(), 5000);
  }

  openApplyModal(job: any) {
    // Save job context to localStorage before redirecting to login
    localStorage.setItem('pendingJobId', job.id || job._id);
    localStorage.setItem('pendingJobTitle', job.title);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  loadJobs() {
    console.log('DEBUG: Fetching jobs for landing page...');
    this.jobService.getAllJobs().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        console.log('DEBUG: Received jobs:', data);
        if (Array.isArray(data) && data.length > 0) {
          // Filter out empty cards (ghost jobs with no title or ID)
          const validJobs = data.filter((j: any) => j && (j.id || j._id) && j.title && j.title.trim().length > 0);
          this.jobs = validJobs.slice(0, 3);
        } else {
          this.useFallbackJobs();
        }
      },
      error: (err: any) => {
        console.error('DEBUG: Failed to fetch jobs from backend:', err);
        this.useFallbackJobs();
      }
    });
  }

  useFallbackJobs() {
    console.log('DEBUG: Using fallback jobs for landing page');
    this.jobs = [
      {
        id: '1',
        title: 'Java Fullstack Developer',
        company: 'Incresol',
        location: 'Hyderabad',
        salary: '2lpa-3lpa',
        jobType: 'FULL-TIME'
      },
      {
        id: '2',
        title: 'SAP Consultant',
        company: 'Incresol',
        location: 'Hyderabad',
        salary: '2lpa-3lpa',
        jobType: 'FULL-TIME'
      },
      {
        id: '3',
        title: 'Junior Java Developer',
        company: 'StepForwardx',
        location: 'Bangalore',
        salary: '5lpa',
        jobType: 'FULL-TIME'
      }
    ];
  }
}
