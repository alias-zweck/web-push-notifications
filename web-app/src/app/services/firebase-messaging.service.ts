import { Injectable } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { MessageService } from "./message.service";

@Injectable({
  providedIn: "root",
})
export class FirebaseMessagingService {
  constructor(private swPush: SwPush, private messageService: MessageService) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      const { notification, data } = event.data?.payload || event.data;
      if (notification && data && event.data.type === "background-message") {
        const { body: text } = notification;
        const { sender, timestamp = new Date(), topic } = data;

        const newMessage = { text, sender, timestamp: new Date(timestamp) };
        this.messageService.addMessage(topic, newMessage);
      }
    });
  }
}
