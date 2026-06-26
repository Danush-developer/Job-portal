import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class Account {
  @Input() currentUser: any;

  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }
}
