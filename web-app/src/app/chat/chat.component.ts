import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';
import { FirebaseMessagingService } from '../firebase-messaging.service.service';

interface Message {
  text: string;
  sender: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private backgroundMessageSubscription!: Subscription;
  private token: string | null = null;
  public currentUser!: string;
  public newMessage!: string;

  constructor(
    public messageService: MessageService,
    private router: Router,
    private firebaseMessagingService: FirebaseMessagingService
  ) { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.messageService.stopListeningForMessages();
    if (this.backgroundMessageSubscription) {
      this.backgroundMessageSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.currentUser = this.messageService.name;
    if (!this.currentUser) {
      this.router.navigate(['/home']);
    }
    this.token = this.messageService.token;
    this.messageService.token$.subscribe((token) => {
      if (!token) {
        this.router.navigate(['/home']);
      }

      this.token = token;

      if (this.token) {
        this.messageService.listenForMessages();
      }
    });

    this.backgroundMessageSubscription = this.firebaseMessagingService.backgroundMessage$.subscribe(message => {
      console.log('Received background message in ChatComponent: ', message);
    });
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  async sendMessage() {
    if (this.newMessage) {
      const message: Message = {
        sender: this.currentUser,
        text: this.newMessage,
        timestamp: new Date(),
      };

      this.messageService.sendMessage(message).subscribe({
        next: (response) => {
          console.log('send message:', response);
        },
        error: (error) => console.error('Error send message:', error),
      });
    }
    this.newMessage = '';
  }

  unsubscribe() {
    if (this.token) {
      this.messageService.unsubscribeFromTopic().subscribe({
        next: (response) => {
          console.log('Unsubscribed from topic:', response);
          this.messageService.name = '';
          localStorage.clear();
          this.router.navigate(['/home']);
        },
        error: (error) => console.error('Error unsubscribed from topic:', error),
      });
    } else {
      console.error('Token is not available. Cannot unsubscribe without token.');
    }
  }

  isValidDate(date: any): boolean {
    return !isNaN(Date.parse(date));
  }
}
