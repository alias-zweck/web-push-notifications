import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
interface Message {
  text: string;
  sender: string;
  timestamp?: Date;
}

interface Group {
  name: string;
  lastMessage: string;
  pic: string;
  status: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private token: string | null = null;
  public currentUser!: string;
  public searchTerm: string = '';
  public newMessage!: string;
  public selectedGroup!: Group | null;
  public groupMessages: Message[] = [];
  public notificationsEnabled: boolean = true; // Default to notifications enabled

  public groups$ = this.messageService.groups$;
  public filteredGroups: Group[] = [];

  constructor(
    public messageService: MessageService,
    private router: Router,
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.messageService.stopListeningForMessages();
  }

  ngOnInit() {
    this.currentUser = this.messageService.name;
    if (!this.currentUser) this.router.navigate(['/home']);
    this.token = this.messageService.token;
    console.log("this.token::::::", this.token);
    this.messageService.token$.subscribe((token) => {
      if (!token) {
        this.router.navigate(['/home']);
      }

      this.token = token;

      if (this.token) {
        this.messageService.listenForMessages();
      }
    });

    this.groups$.subscribe(groups => {
      this.filteredGroups = groups;
    });

    this.messageService.messages$.subscribe((messages) => {
      if(this.selectedGroup){
        this.selectGroup(this.selectedGroup);
      }
    });

    // Load the initial state of notificationsEnabled from localStorage
    const savedState = localStorage.getItem('notificationsEnabled');
    this.notificationsEnabled = savedState ? JSON.parse(savedState) : true;
    this.notifyServiceWorker();
  }

  onSearchChange() {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredGroups = this.messageService.groups$.getValue().filter(group =>
      group.name.toLowerCase().includes(searchTermLower)
    );
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.groupMessages = this.messageService.messagesByTopic[group.name] || [];
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  async sendMessage() {
    if (this.newMessage && this.selectedGroup && this.selectedGroup.status === 'Active') {
      const message: Message = {
        sender: this.currentUser,
        text: this.newMessage,
        timestamp: new Date(),
      };

      this.messageService.sendMessage(this.selectedGroup.name, message).subscribe({
        next: (response) => {
          console.log('send message:', response);
        },
        error: (error) => console.error('Error send message:', error),
      });

      this.groupMessages = this.messageService.messagesByTopic[this.selectedGroup.name] || [];
      this.scrollToBottom();
    }
    this.newMessage = '';
  }

  async logout() {
    if (this.token) {
      this.messageService.unsubscribeAllActiveGroups();
      this.messageService.clearLocalStorage()
      this.router.navigate(['/home']);
    } else {
      console.error('Token is not available. Cannot unsubscribe without token.');
    }
  }

  active() {
    if (this.selectedGroup?.name) {
      this.messageService.subscribeToTopic(this.selectedGroup.name).subscribe({
        next: (response) => {
          console.log(`Subscribed to topic: ${this.selectedGroup?.name}`, response);
          this.selectedGroup!.status = 'Active';
          if(this.selectedGroup?.name){
            this.messageService.setGroupStatus(this.selectedGroup.name, 'Active');
          }
        },
        error: (error) => {
          console.error(`Error subscribing to topic: ${this.selectedGroup?.name}`, error);
        }
      });
    }
  }

  inactive() {
    if (this.selectedGroup?.name) {
      this.messageService.unsubscribeFromTopic(this.selectedGroup.name).subscribe({
        next: (response) => {
          console.log(`Unsubscribed from topic: ${this.selectedGroup?.name}`, response);
          this.selectedGroup!.status = 'Inactive';
          if(this.selectedGroup?.name){
            this.messageService.setGroupStatus(this.selectedGroup.name, 'Inactive');
          }
        },
        error: (error) => {
          console.error(`Error unsubscribing from topic: ${this.selectedGroup?.name}`, error);
        }
      });
    }
  }

  toggleNotifications() {
    localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));

    this.notifyServiceWorker();
  }

  notifyServiceWorker() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'update-notifications-enabled',
        payload: this.notificationsEnabled
      });
    } else {
     window.location.reload()
    }
  }
}
