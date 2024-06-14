import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/compat/messaging";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

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

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private backendUrl = "https://us-central1-push-notification-b5146.cloudfunctions.net";

  public topics: string[] = [
    "Politics",
    "Business",
    "Technology",
    "Education",
    "Sports",
    "Entertainment",
    "Lifestyle",
    "Travel",
  ];

  private fcm_token = new BehaviorSubject<string | null>(null);
  private username = new BehaviorSubject<string>("");
  public messagesByTopic: { [topic: string]: Message[] } = {};

  private messagesSubscription: Subscription | null = null;

  public token$ = this.fcm_token.asObservable();
  public messages$ = new BehaviorSubject<Message[]>([]);
  public groups$ = new BehaviorSubject<Group[]>([]);

  constructor(
    private afMessaging: AngularFireMessaging,
    private http: HttpClient,
  ) {
    this.loadGroupsFromLocalStorage();
    this.loadMessagesFromLocalStorage();
  }

  private initializeGroups() {
    const groups: Group[] = this.topics.map(topic => ({
      name: topic,
      lastMessage: '',
      pic: `https://picsum.photos/seed/${topic.toLowerCase()}/100`,
      status: 'Inactive',
    }));
    this.groups$.next(groups);
    this.saveGroupsToLocalStorage();
  }

  private saveGroupsToLocalStorage() {
    localStorage.setItem('groups', JSON.stringify(this.groups$.getValue()));
  }

  private loadGroupsFromLocalStorage() {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      this.groups$.next(JSON.parse(storedGroups));
    } else {
      this.initializeGroups();
    }
  }

  private saveMessagesToLocalStorage() {
    localStorage.setItem('messagesByTopic', JSON.stringify(this.messagesByTopic));
  }

  private loadMessagesFromLocalStorage() {
    const storedMessages = localStorage.getItem('messagesByTopic');
    if (storedMessages) {
      this.messagesByTopic = JSON.parse(storedMessages);
      this.updateMessages();
    }
  }

  requestPermission() {
    this.afMessaging.requestPermission.subscribe({
      next: (permission) => {
        console.log("Permission: ", permission);
        if (permission === "granted") {
          console.log("Notification permission granted");
          setTimeout(() => {
            this.getToken();
          }, 1000);
        } else {
          console.log(permission);
          alert("Unable to get permission to notify");
        }
      },
      error: (error) => {},
    });

    this.afMessaging.requestToken.subscribe({
      next: (token) => {
        this.token = token;
        if (!token) {
          console.log("Token Removed");
        } else {
          console.log("Token updated");
        }
      },
      error: (error) => {},
    });
  }

  listenForMessages() {
    console.log("listenForMessages");
    this.messagesSubscription = this.afMessaging.messages.subscribe({
      next: (message) => {
        console.log("New message received: ", message);
        const { notification, data } = message as any;
        if (data) {
          const { body: text } = notification ?? data;

          const { sender, timestamp = new Date(), topic } = data;

          if (text && sender && sender !== this.name) {
            const newMessage: Message = { text, sender, timestamp: new Date(timestamp) } as Message;
            this.addMessage(topic, newMessage);
          }
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  stopListeningForMessages() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
      this.messagesSubscription = null;
    }
  }

  subscribeToTopic(topic: string) {
    return this.http.post(`${this.backendUrl}/subscribe`, {
      token: this.token,
      topic,
    });
  }

  unsubscribeFromTopic(topic: string) {
    return this.http.post(`${this.backendUrl}/unsubscribe`, {
      token: this.token,
      topic,
    });
  }

  sendMessage(topic: string, message: Message): Observable<any> {
    this.addMessage(topic, message);
    return this.http.post(`${this.backendUrl}/publish`, {
      message,
      topic,
    });
  }

  public addMessage(topic: string, message: Message) {
    if (!this.messagesByTopic[topic]) {
      this.messagesByTopic[topic] = [];
    }
    this.messagesByTopic[topic].push(message);
    this.updateMessages();
    this.updateGroupLastMessage(topic, message);
    this.sortGroups();
    this.saveMessagesToLocalStorage();
  }

  private updateMessages() {
    const allMessages = Object.values(this.messagesByTopic).flat();
    this.messages$.next(allMessages);
  }

  private updateGroupLastMessage(topic: string, message: Message) {
    const groups = this.groups$.getValue();
    const group = groups.find(g => g.name === topic);
    if (group) {
      group.lastMessage = message.text;
      group.timestamp = message.timestamp;
      this.groups$.next(groups);
      this.saveGroupsToLocalStorage();
    }
  }

  private sortGroups() {
    const groups = this.groups$.getValue();
    groups.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
    this.groups$.next(groups);
    this.saveGroupsToLocalStorage();
  }

  private getToken(): void {
    try {
      this.afMessaging.getToken.subscribe((token) => {
        this.token = token;
        if (!token) {
          console.log("Token Removed");
        } else {
          console.log("Get token");
        }
      });
    } catch (error) {}
  }

  get token(): string | null {
    return this.fcm_token.getValue();
  }

  set token(token: string | null) {
    if (!token && this.token) {
      console.log("Calling Unsubscribe");
      this.unsubscribeAllActiveGroups().then(() => {
        this.fcm_token.next(token);
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

  setGroupStatus(groupName: string, status: string) {
    const groups = this.groups$.getValue();
    const group = groups.find(g => g.name === groupName);
    if (group) {
      group.status = status;
      this.groups$.next(groups);
      this.saveGroupsToLocalStorage();
    }
  }

  async unsubscribeAllActiveGroups() {
    const activeGroups = this.groups$.getValue().filter(group => group.status === 'Active');
    const unsubscribePromises = activeGroups.map(group => {
      return new Promise((resolve, reject) => {
        this.unsubscribeFromTopic(group.name).subscribe({
          next: (response) => {
            console.log(`Unsubscribed from topic: ${group.name}`, response);
            resolve(response);
          },
          error: (error) => {
            console.error(`Error unsubscribing from topic: ${group.name}`, error);
            reject(error);
          }
        });
      });
    });

    await Promise.allSettled(unsubscribePromises).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`Successfully unsubscribed from ${activeGroups[index].name}`, result.value);
        } else {
          console.error(`Failed to unsubscribe from ${activeGroups[index].name}`, result.reason);
        }
      });
    });
  }

  clearLocalStorage() {
    this.name = '';
    this.messages$.next([]);
    this.groups$.next([]);
    localStorage.clear();
    this.loadGroupsFromLocalStorage();
  }
}
