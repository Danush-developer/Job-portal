import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class Analytics {
  @Input() applications: any[] = [];
  @Input() jobs: any[] = [];
  @Input() analyticsData: any = {};
  @Input() getStatusCountForJob!: (job: any, status: string) => number;
  @Input() getPieStyle!: (data: any[]) => string;

  @Output() refreshData = new EventEmitter<void>();

  onRefresh() {
    this.refreshData.emit();
  }
}
