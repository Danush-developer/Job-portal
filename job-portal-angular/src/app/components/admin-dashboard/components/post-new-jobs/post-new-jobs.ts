import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-post-new-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-new-jobs.html',
  styleUrls: ['./post-new-jobs.css']
})
export class PostNewJobs {
  @Input() editingJob: any = null;

  @Input() jobForm: any = {
    title: '',
    description: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    experienceLevel: '',
    salary: '',
    requiredSkills: '',
    postedBy: '',
    startDate: '',
    endDate: ''
  };

  @Output() submitJob = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private toastr: ToastrService) {}

  onSubmitJob() {
    if (this.editingJob) {
      this.toastr.success('Job updated successfully');
    } else {
      this.toastr.success('Job created successfully');
    }

    this.submitJob.emit(this.jobForm);
  }

  onCancel() {
    this.cancel.emit();
  }
}