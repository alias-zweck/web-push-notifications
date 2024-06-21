import { Component } from '@angular/core';
import { MessageService } from './services/message.service';
import { FirebaseMessagingService } from './services/firebase-messaging.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  token: string | null = null;

  constructor(private messageService: MessageService, private firebaseMessagingService: FirebaseMessagingService, private swUpdate: SwUpdate) { }

  ngOnInit() {
    console.log("swUpdate", this.swUpdate.isEnabled);
    
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
      ).subscribe(event => {
        if (confirm('New version available. Load new version?')) {
          window.location.reload();
        }
      });
    }
    this.requestPermission();
    this.token = this.messageService.token;
    this.messageService.token$.subscribe((token) => {
      this.token = token;
    });
  }

  requestPermission() {
    this.messageService.requestPermission();
  }
}
