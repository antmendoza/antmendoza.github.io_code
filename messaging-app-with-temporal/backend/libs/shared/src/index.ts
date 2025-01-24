import { defineQuery, defineSignal, defineUpdate } from '@temporalio/workflow';

export const taskQueue = 'msg-taskqueue';

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

export type UserSessionRequest = {
  userId: string;
};

export type ChatWorkflowRequest = {
  users: string[];
  usersWorkflowId: string[];
};

export type SendMessageRequest = {
  content: string;
  senderUserId: string;
};

export type Message = {
  sender: string;
  content: string;
};

export type NotifyNewMessageRequest = {
  chatId: string;
};

export type AckNotificationsInChatRequest = {
  chatId: string;
};

export const getChatList = defineQuery<ChatInfo[], null>('getChatList');
export const getContactList = defineQuery<string[], null>('getContactList');
export const addContact = defineUpdate<string, null>('addContact');
export const startChatWithContact = defineUpdate<string, null>('startChatWithContact');
export const joinChatWithContact = defineSignal<[JoinChatWithContactRequest]>('joinChatWithContact');
export const getNotifications = defineQuery<GetNotificationsResponse[], null>('getNotifications');
export const notifyNewMessage = defineSignal<[NotifyNewMessageRequest]>('newMessageInChat');
export const ackNotificationsInChat = defineUpdate<[AckNotificationsInChatRequest], null>('ackNotifications');

export const getDescription = defineQuery<ChatWorkflowRequest, null>('getDescription');
export const getDescriptionForUser = defineQuery<string, [string]>('getDescriptionForUser');
export const sendMessage = defineSignal<[SendMessageRequest]>('sendMessage');
