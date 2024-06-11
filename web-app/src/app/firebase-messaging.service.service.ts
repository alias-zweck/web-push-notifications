import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private backgroundMessageSubject = new BehaviorSubject<any>(null);
  public backgroundMessage$ = this.backgroundMessageSubject.asObservable();

  constructor(private swPush: SwPush) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'background-message') {
        this.backgroundMessageSubject.next(event.data.payload);
      }
    });
  }
}
