import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-candidates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-candidates.html',
  styleUrls: ['./all-candidates.css']
})
export class AllCandidates {
  @Input() filteredApplications: any[] = [];
  @Input() currentFilterTitle: string = '';
  @Input() isScreening: string | null = null;
  
  // Note: the getAppMatchScore is technically a method in the parent, but we can compute it here or pass it.
  // We will pass the parent component's method as an input or we can just redefine the simple getters here
  // But wait, getAppMatchScore requires logic. We can pass the function as an input.
  @Input() getAppMatchScore!: (app: any) => number;
  @Input() getScoreColor!: (score: number) => string;

  @Output() clearFilter = new EventEmitter<void>();
  @Output() filterApplications = new EventEmitter<string>();
  @Output() updateStatus = new EventEmitter<{ appId: string, status: string }>();
  @Output() viewResume = new EventEmitter<string>();
  @Output() deleteApplication = new EventEmitter<string>();
  @Output() viewAIInsights = new EventEmitter<any>();

  onClearFilter() {
    this.clearFilter.emit();
  }

  onFilter(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.filterApplications.emit(term);
  }

  onUpdateStatus(appId: string, status: string) {
    this.updateStatus.emit({ appId, status });
  }

  onViewResume(appId: string) {
    this.viewResume.emit(appId);
  }

  onDeleteApplication(appId: string) {
    this.deleteApplication.emit(appId);
  }

  onViewAIInsights(app: any) {
    this.viewAIInsights.emit(app);
  }
}
