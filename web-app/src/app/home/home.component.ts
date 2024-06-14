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
  isLoading: boolean = true;

  constructor(private router: Router, private messageService: MessageService) {
  }

  ngOnInit() {
    this.token = this.messageService.token;
    this.messageService.token$.subscribe((token) => {
      this.token = token;
      if(this.token){
        this.isLoading =false;
      }
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
      this.router.navigate(['/chat']);
    } else {
      alert('Please enter your name.');
    }
  }
}
