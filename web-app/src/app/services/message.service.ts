import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

interface Message {
  text: string;
  sender: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private backendUrl = 'https://us-central1-push-notification-b5146.cloudfunctions.net';
  private topic = 'chat-messages';

  private fcm_token = new BehaviorSubject<string | null>(null);
  private username = new BehaviorSubject<string>('');
  private messages = new BehaviorSubject<Message[]>(
    JSON.parse(localStorage.getItem('messages') || '[]')
  );

  private messagesSubscription: Subscription | null = null;

  public token$ = this.fcm_token.asObservable();
  public messages$ = this.messages.asObservable();

  constructor(
    private afMessaging: AngularFireMessaging,
    private http: HttpClient
  ) {}

  requestPermission() {
    this.afMessaging.requestPermission.subscribe({
      next: (permission) => {
        console.log('Permission: ', permission);
        if (permission === 'granted') {
          console.log('Notification permission granted');
          this.getToken();
        } else {
          console.log(permission);
          alert('Unable to get permission to notify');
        }
      },
      error: (error) => {
        console.log(error);
      },
    });

    this.afMessaging.requestToken.subscribe({
      next: (token) => {
        this.token = token;
        if (!token) {
          console.log('Token Removed');
        } else {
          console.log('Token updated');
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  listenForMessages() {
    console.log('listenForMessages');
    this.messagesSubscription = this.afMessaging.messages.subscribe({
      next: (message) => {
        console.log('New message received: ', message);
        const { notification, data } = message as any;
        if (notification && data) {
          const { body: text } = notification;
          const { sender, timestamp = new Date() } = data;

          if (text && sender && sender !== this.name) {
            const newMessage: Message = { text, sender, timestamp } as Message;
            this.newMessage = newMessage;
          }
        }
      },
      error: (error) => {
        console.error('===listenForMessages====error=======', error);
      },
    });
  }

  stopListeningForMessages() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
      this.messagesSubscription = null;
    }
  }

  subscribeToTopic() {
    return this.http.post(`${this.backendUrl}/subscribe`, { token: this.token, topic: this.topic });
  }

  unsubscribeFromTopic() {
    return this.http.post(`${this.backendUrl}/unsubscribe`, { token: this.token, topic: this.topic });
  }

  sendMessage(message: Message): Observable<any> {
    this.newMessage = message;
    return this.http.post(`${this.backendUrl}/publish`, { message, topic: this.topic });
  }

  private getToken(): void {
    this.afMessaging.getToken.subscribe((token) => {
      this.token = token;
      if (!token) {
        console.log('Token Removed');
      } else {
        console.log('Get token');
      }
    });
  }

  get token(): string | null {
    return this.fcm_token.getValue();
  }

  set token(token: string | null) {
    if (!token && this.token) {
      console.log('Calling Unsubscribe');
      this.unsubscribeFromTopic().subscribe({
        next: (response) => {
          console.log('Unsubscribed to topic:', response);
          this.fcm_token.next(token);
        },
        error: (error) =>
          console.error('Error unsubscribed to topic:', error),
      });
    } else {
      this.fcm_token.next(token);
    }
  }

  get name(): string {
    return this.username.getValue();
  }

  set name(name: string) {
    this.username.next(name);
  }

  set newMessage(message: Message) {
    this.messages.next([...this.messages.getValue(), message]);
    localStorage.setItem('messages', JSON.stringify(this.messages.getValue()));
  }
}
