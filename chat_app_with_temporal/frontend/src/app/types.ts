export type AckNotificationsInChatRequest = {
  chatId: string;
};

export type ChatInfo = {
  chatId: string;
  pendingNotifications: number;
  started: boolean;
  userId: string;
};

export type GetNotificationsResponse = {
  chatId: string;
  pendingNotifications: number;
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

export type ChatWorkflowRequest = {
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
