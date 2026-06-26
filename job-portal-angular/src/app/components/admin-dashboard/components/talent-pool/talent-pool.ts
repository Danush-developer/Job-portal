import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-talent-pool',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talent-pool.html',
  styleUrls: ['./talent-pool.css']
})
export class TalentPool {
  @Input() filteredTalent: any[] = [];

  @Output() refreshPool = new EventEmitter<void>();
  @Output() filterTalent = new EventEmitter<string>();
  @Output() deleteTalent = new EventEmitter<string>();

  onRefresh() {
    this.refreshPool.emit();
  }

  onFilter(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.filterTalent.emit(term);
  }

  onDelete(id: string) {
    this.deleteTalent.emit(id);
  }
}
