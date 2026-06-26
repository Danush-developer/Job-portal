import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-jobs.html',
  styleUrls: ['./discover-jobs.css']
})
export class DiscoverJobs {
  @Input() filteredJobs: any[] = [];
  @Input() calculateMatchScore!: (job: any) => number;
  @Input() getScoreColor!: (score: number) => string;
  @Input() hasApplied!: (jobId: string) => boolean;

  @Output() applyJob = new EventEmitter<any>();

  onApplyForm(job: any) {
    this.applyJob.emit(job);
  }
}
