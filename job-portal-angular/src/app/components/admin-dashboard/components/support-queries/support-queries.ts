import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-queries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-queries.html',
  styleUrls: ['./support-queries.css']
})
export class SupportQueries {
  @Input() filteredMessages: any[] = [];

  @Output() refreshQueries = new EventEmitter<void>();
  @Output() filterMessages = new EventEmitter<string>();
  @Output() updateMessageStatus = new EventEmitter<{ id: string, status: string }>();
  @Output() deleteMessage = new EventEmitter<string>();

  onRefresh() {
    this.refreshQueries.emit();
  }

  onFilter(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.filterMessages.emit(term);
  }

  onUpdateStatus(id: string, status: string) {
    this.updateMessageStatus.emit({ id, status });
  }

  onDelete(id: string) {
    this.deleteMessage.emit(id);
  }
}
