import { Component } from '@angular/core';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'client';

  token: string | null = null;

  constructor(private messageService: MessageService) {
    this.requestPermission();
  }

  ngOnInit() {
    this.token = this.messageService.token;
    this.messageService.token$.subscribe((token) => {
      this.token = token;
    });
  }

  requestPermission() {
    this.messageService.requestPermission();
  }
}
