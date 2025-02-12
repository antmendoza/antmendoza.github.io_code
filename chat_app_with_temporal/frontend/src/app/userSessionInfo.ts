import {UserSession} from "./types";

export class UserSessionInfo {
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
