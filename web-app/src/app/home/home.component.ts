import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private token: string | null = null;
  userName: string = '';

  constructor(private router: Router, private messageService: MessageService) {
  }

  ngOnInit() {
    this.token = this.messageService.token;
    this.messageService.token$.subscribe((token) => {
      this.token = token;
    });
  }

  startChat(): void {
    const name = this.userName.trim();

    if(!this.token){
    return  alert("You need to allow notifications before proceeding.")
    }

    if (name) {
      console.log('Starting chat for:', name);
      this.messageService.name = name;
      this.subscribe();
      this.router.navigate(['/chat']);
    } else {
      alert('Please enter your name.');
    }
  }

  subscribe() {
    if (this.token) {
      // this.messageService.subscribeToTopic().subscribe({
      //   next: (response) => {
      //     console.log('Subscribed to topic:', response);
      //   },
      //   error: (error) => console.error('Error subscribing to topic:', error),
      // });
    } else {
      console.error('Token is not available. Cannot subscribe without token.');
    }
  }
}
