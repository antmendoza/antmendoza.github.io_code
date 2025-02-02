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
import {UserSession} from './types';


class UserSessionInfo {
  private userSession: UserSession;

  constructor(userSession: any) {
    this.userSession= userSession;
  }

  public isSessionCreated(): boolean {
    return this.userSession !== null;
  }

  getUserId(): string {
    if(this.isSessionCreated()){
      return this.userSession.userId;
    }
    return '';
  }

  getContacts() {
    console.log(this.userSession.contacts)
    if(this.isSessionCreated()){
      return this.userSession.contacts;
    }
    return [];
  }

  getChats() {
    if(this.isSessionCreated()){
      return this.userSession.chats;
    }
    return [];
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
  private chatUrl = 'http://localhost:3000/chats';
  private chatUserSession = 'http://localhost:3000/user-sessions';
  protected sessionInfo: UserSessionInfo = new UserSessionInfo(null);
  protected activeChat: any = null;

  constructor(private http: HttpClient) {
    this.getUsers();
  }



/////////////////////////// UI METHODS ///////////////////////////

  selectUser(userId: string) {
    this.startSession(userId).subscribe((v) => {

      this.reloadSessionInfo(userId);
      setTimeout(() => {
        this.reloadSessionInfo(userId);
      }, 1000);

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



  openChat(chatId: string) {
    this.getChatInfo(chatId).subscribe((v) => {
      this.activeChat = v;
    });
  }

/////////////////////////// HTTP METHODS ///////////////////////////

  private getUsers() {
    this.http.get<string[]>(this.url + "/users")
      .subscribe((data: any) => {
        console.log(data);
        this.users = data.users;
      });
  }



  private startSession(userId: string) {
    return this.http.post<void>(this.chatUserSession + "/start-session/" + userId, null);

  }



  //create method add contact to chat, where the parameter is the userId and the contactId is the body
  private addContactToChat(userId: string, contactId: string) {
    return this.http.post<void>(this.chatUserSession + '/' + userId + '/add-contact',
      {contact: contactId}
    );
  }

  private getSessionInfo(userId: string) {
    return this.http.get<any[]>(this.chatUserSession + '/' + userId);

  }

  private startChatWithContact(userId: string, contactId: string) {
    return this.http.post<void>(this.chatUserSession + '/' + userId + '/start-chat',
      {contact: contactId}
    );
  }



  private getChatInfo(chatId: string) {
    return this.http.get<void>(this.chatUrl + '/' + chatId );
  }


}
