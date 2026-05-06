import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private client: Client | null = null;
  private notificationSubject = new Subject<string>();
  public notifications$ = this.notificationSubject.asObservable();

  constructor() { }

  connect(userId: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      onConnect: () => {
        this.client?.subscribe(`/topic/notifications/${userId}`, (message) => {
          this.notificationSubject.next(message.body);
        });
      },
      debug: (str) => {
        // console.log(str);
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}

