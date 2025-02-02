export type AckNotificationsInChatRequest = {
  chatId: string;
};

export enum CHAT_STATUS {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  FAILED = 'FAILED',
}

export type ChatInfo = {
  chatId: string;
  pendingNotifications: number;
  status: CHAT_STATUS;
  userId: string;
};

export type JoinChatWithContactRequest = {
  chatId: string;
  userId: string;
};

export type UserSession = {
  userId: string;
  contacts: string[];
  // store the chats workflows as workflow input to carry it over to the next workflow when continue as new
  chats: ChatInfo[];
};

export type ChatWorkflowInfo = {
  users: string[];
  usersWorkflowId: string[];
  messages: Message[];
};

export type SendMessageRequest = {
  id: string;
  content: string;
  senderUserId: string;
};

export type Message = {
  id: string;
  sender: string;
  content: string;
  processed: boolean;
};

export type NotifyNewMessageRequest = {
  chatId: string;
};
