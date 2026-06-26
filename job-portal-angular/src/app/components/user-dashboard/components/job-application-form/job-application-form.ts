import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-application-form.html',
  styleUrls: ['./job-application-form.css']
})
export class JobApplicationForm {
  @Input() selectedJob: any = null;
  @Input() applicationForm: any = {};
  @Input() selectedFile: File | null = null;
  @Input() isUploading: boolean = false;

  @Output() submitApplication = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<any>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  onSubmit() {
    this.submitApplication.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onFileSelected(event: any) {
    this.fileSelected.emit(event);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
}
