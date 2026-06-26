import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-job-postings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-job-postings.html',
  styleUrls: ['./my-job-postings.css']
})
export class MyJobPostings {
  @Input() jobs: any[] = [];
  @Input() jobApplicantCounts: { [key: string]: number } = {};

  @Output() viewApplications = new EventEmitter<{ jobId: string, jobTitle: string }>();
  @Output() editJob = new EventEmitter<any>();
  @Output() deleteJob = new EventEmitter<string>();
  @Output() switchView = new EventEmitter<string>();

  constructor(private toastr: ToastrService) {}

  getJobCount(job: any): number {
    if (!job) return 0;

    const id = String(job.id || job._id || '');
    const title = String(job.title || '').toLowerCase().trim();

    return this.jobApplicantCounts[id] || this.jobApplicantCounts[title] || 0;
  }

  getTotalActiveApplicants(): number {
    return this.jobs.reduce((total, job) => total + this.getJobCount(job), 0);
  }

  onViewApplications(jobId: string, jobTitle: string): void {
    this.viewApplications.emit({ jobId, jobTitle });
  }

  onEditJob(job: any): void {
    this.toastr.info('Edit job opened');
    this.editJob.emit(job);
  }

  onDeleteJob(id: string): void {
    const confirmDelete = confirm('Are you sure you want to delete this job?');

    if (confirmDelete) {
      this.deleteJob.emit(id);
      this.toastr.success('Job deleted successfully');
    }
  }

  onPostNewJob(): void {
    this.switchView.emit('post-job');
  }
}