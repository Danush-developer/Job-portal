import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.css']
})
export class MyApplications {
  @Input() myApplications: any[] = [];
  @Input() getCleanLink!: (link: string) => string;

  @Output() viewDetails = new EventEmitter<any>();
  @Output() findJobs = new EventEmitter<void>();

  onViewDetails(app: any) {
    this.viewDetails.emit(app);
  }

  onFindJobs() {
    this.findJobs.emit();
  }
}
