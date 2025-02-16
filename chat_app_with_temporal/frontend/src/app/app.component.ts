import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MatNativeDateModule} from '@angular/material/core';
import {
  AckNotificationsInChatRequest,
  CHAT_STATUS,
  ChatInfo,
  ChatWorkflowInfo,
  Message,
  SendMessageRequest
} from './types';
import {Observable} from 'rxjs';
import {UserSessionInfo} from './userSessionInfo';
import {OpenChat} from './openChat';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [HttpClientModule, MatButtonModule,
    MatFormFieldModule, MatIconModule,
    MatInputModule, MatCardModule,
    MatCheckboxModule, FormsModule,
    CommonModule, MatDialogModule,
    MatNativeDateModule
  ]
})


export class AppComponent {


  protected users: string[] = [];

  private url = 'http://localhost:3000';
  private chatUrl = this.url + '/chats';
  private chatUserSessionUrl = this.url + '/user-sessions';
  protected sessionInfo: UserSessionInfo = new UserSessionInfo(null);
  // @ts-ignore
  protected openChat: OpenChat = new OpenChat(null, null);
  protected messageContent: string = '';
  private reloadTime = 1_000;
  addingContact: boolean = false;


  constructor(private http: HttpClient) {
    this.getUsers();

  }


  private async sendMessage_(user1: string, message: string, messageNumberThenSend: number) {

    while (!this.openChat.isActive()) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (this.sessionInfo.getUserId() == user1) {

      await new Promise(resolve => setTimeout(resolve, 1000))
      const messages = this.openChat.chatInfo.messages;
      this.messageContent = message;
      let messageLength = messages.length;
      if (messageLength == messageNumberThenSend) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.sendMessage();
      }
    }
  }

/////////////////////////// UI METHODS ///////////////////////////


  private reloadSessionInfoInterval: any = null;


  selectUser(userId: string) {
    this.startSession(userId).subscribe((v) => {

      this.reloadSessionInfo(userId);

      if (this.reloadSessionInfoInterval) {
        clearInterval(this.reloadSessionInfoInterval);
      }
      this.reloadSessionInfoInterval = setInterval(() => {
        this.reloadSessionInfo(userId);
      }, this.reloadTime);

    });
  }

  private reloadSessionInfo(userId: string) {
    return this.getSessionInfo(userId).subscribe((v) => {
      this.sessionInfo = new UserSessionInfo(v);
    });
  }

  addContact() {
    this.addingContact = true;
  }


  saveContact(contact: any){
    if (contact.value) {
      this.addContactToChat(this.sessionInfo.getUserId(), contact.value).subscribe((v) => {
        this.reloadSessionInfo(this.sessionInfo.getUserId());
      });
    }
    this.addingContact = false;
  }


  startChat(contact: string) {
    this.startChatWithContact(this.sessionInfo.getUserId(), contact).subscribe((v) => {
      this.reloadSessionInfo(this.sessionInfo.getUserId());
    });
  }

  private reloadChatInfoInterval: any = null;

  selectChat(chatId: string) {
    this.closeChat();
    this.reloadChatInfo(chatId);
    this.reloadChatInfoInterval = setInterval(() => {
      this.reloadChatInfo(chatId);
    }, this.reloadTime);
  }

  reloadChatInfo(chatId: string) {
    const chat = this.sessionInfo.getChats().find((c: ChatInfo) =>
      c.chatId == chatId && c.status);

    if (chat?.status != CHAT_STATUS.STARTED) {
      return;
    }

    this.ackNotifications(chatId).subscribe((v) => {
      this.getChatInfo(chatId).subscribe((v) => {
        this.openChat = new OpenChat(chatId, v);
        const elem = document.getElementById('chat-container');
        if (elem) {
          elem.scrollTop = elem.scrollHeight;
        }
      });
    });
  }

  private ackNotifications(chatId: string) {
    const chat = this.sessionInfo.getChats().find((c: ChatInfo) => c.chatId == chatId);
    if (chat && chat.pendingNotifications > 0) {
      return this.ackNotificationsInChat(this.sessionInfo.getUserId(), {chatId: chatId});
    }

    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });

  }

  closeChat() {
    if (this.reloadChatInfoInterval) {
      clearInterval(this.reloadChatInfoInterval);
    }
    this.openChat = new OpenChat(null, null);
  }


  sendMessage() {
    const chatId = this.openChat.chatId;
    this.sendMessageToChat(chatId,
      {
        content: this.messageContent,
        id: Math.random() + "",
        senderUserId: this.sessionInfo.getUserId(),
        timestamp: new Date().toISOString()
      }).subscribe((v) => {
      this.reloadChatInfo(chatId);
    });
    this.messageContent = '';
  }



  hasSelectableContacts() {
    return this.selectableContacts().length > 0
  }


  selectableContacts() {
    const contacts = this.users.filter((u) => {
      return u!=this.sessionInfo.getUserId() &&
        !this.sessionInfo.getContacts().includes(u);
    });

    if(contacts.length > 0){
      contacts.unshift("");
    }
    return contacts;
  }


  logout() {
    this.sessionInfo = new UserSessionInfo(null);
    this.openChat = new OpenChat(null, null);
    clearInterval(this.reloadSessionInfoInterval);
    clearInterval(this.reloadChatInfoInterval);
  }
/////////////////////////// HTTP METHODS ///////////////////////////

  private getUsers() {
    this.http.get<string[]>(this.url + "/users")
      .subscribe((data: any) => {
        this.users = data.users;
      });
  }

  private startSession(userId: string) {
    return this.http.post<void>(this.chatUserSessionUrl + "/start-session/" + userId, null);
  }


  //create method add contact to chat, where the parameter is the userId and the contactId is the body
  private addContactToChat(userId: string, contactId: string) {
    return this.http.post<void>(this.chatUserSessionUrl + '/' + userId + '/add-contact',
      {contact: contactId}
    );
  }

  private getSessionInfo(userId: string) {
    return this.http.get<any[]>(this.chatUserSessionUrl + '/' + userId);

  }

  private startChatWithContact(userId: string, contactId: string) {
    return this.http.post<void>(this.chatUserSessionUrl + '/' + userId + '/start-chat',
      {contact: contactId}
    );
  }


  private getChatInfo(chatId: string): Observable<ChatWorkflowInfo> {
    return this.http.get<ChatWorkflowInfo>(this.chatUrl + '/' + chatId);
  }

  private sendMessageToChat(chatId: string, message: SendMessageRequest) {
    return this.http.post<void>(this.chatUrl + '/' + chatId + '/send-message',
      message
    );
  }

  private ackNotificationsInChat(userId: string, request: AckNotificationsInChatRequest) {
    return this.http.post<void>(this.chatUserSessionUrl + '/' + userId + '/ack-notifications',
      request
    );
  }


  messageStyle(message: Message) {
    if (message.sender == this.sessionInfo.getUserId()) {
      return 'right-message bubble';
    } else {
      return 'left-message bubble';
    }
  }
}
