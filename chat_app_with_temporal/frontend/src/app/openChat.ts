import {ChatWorkflowInfo} from "./types";

export class OpenChat {
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
