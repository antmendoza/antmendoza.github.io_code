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
import {AckNotificationsInChatRequest, ChatWorkflowInfo, SendMessageRequest, UserSession} from './types';
import {Observable} from 'rxjs';


class UserSessionInfo {
  private userSession: UserSession;

  constructor(userSession: any) {
    this.userSession = userSession;
  }

  public isSessionCreated(): boolean {
    return this.userSession !== null;
  }

  getUserId(): string {
    if (this.isSessionCreated()) {
      return this.userSession.userId;
    }
    return '';
  }

  getContacts() {
    if (this.isSessionCreated()) {
      return this.userSession.contacts;
    }
    return [];
  }

  getChats() {
    if (this.isSessionCreated()) {
      return this.userSession.chats;
    }
    return [];
  }
}


class OpenChat {
  chatInfo: ChatWorkflowInfo;
  chatId: string;

  constructor(chatId: any, chatInfo: any) {
    this.chatId = chatId;
    this.chatInfo = chatInfo;
  }

  isActive(): boolean {
    return this.chatId != null;
  }

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [HttpClientModule, MatButtonModule,
    MatFormFieldModule, MatIconModule,
    MatInputModule, MatCardModule,
    MatCheckboxModule, FormsModule,
    CommonModule, MatDialogModule,
    MatNativeDateModule,
  ]
})


export class AppComponent {


  protected users: string[] = [];

  //TODO: replace with your user id
  private url = 'http://localhost:3000';
  private chatUrl = this.url+'/chats';
  private chatUserSessionUrl = this.url+'/user-sessions';
  protected sessionInfo: UserSessionInfo = new UserSessionInfo(null);
  // @ts-ignore
  protected openChat: OpenChat = new OpenChat(null, null);
  protected messageContent: string='';
  private reloadTime = 1_000;


  constructor(private http: HttpClient) {
    this.getUsers();
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
    const contactName = prompt('Enter contact name');
    if (contactName) {
      this.addContactToChat(this.sessionInfo.getUserId(), contactName).subscribe((v) => {
        this.reloadSessionInfo(this.sessionInfo.getUserId());
      });
    }
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
    this.ackNotificationsInChat(this.sessionInfo.getUserId(), {chatId: chatId}).subscribe((v) => {
      this.getChatInfo(chatId).subscribe((v) => {
        this.openChat = new OpenChat(chatId, v);
      });
    });
  }

  closeChat() {
    if(this.reloadChatInfoInterval){
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
        senderUserId: this.sessionInfo.getUserId()
      }).subscribe((v) => {
      this.reloadChatInfo(chatId);
    });
    this.messageContent = '';
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
}
