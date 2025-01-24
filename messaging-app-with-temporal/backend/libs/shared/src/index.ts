import { defineQuery, defineSignal, defineUpdate } from '@temporalio/workflow';

export const taskQueue = 'msg-taskqueue';



export type ChatInfo = {
  chatId: string;
};

export type ChatNotification = {
  chatId: string;
  pendingMessages: number;
};

export type UserWorkflowRequest = {
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



export type NewMessageInChatRequest = {
  chatId: string;
};

export const getChatList = defineQuery<ChatInfo[], null>('getChatList');
export const getContactList = defineQuery<string[], null>('getContactList');
export const addContact = defineUpdate<string, null>('addContact');
export const startChatWithContact = defineUpdate<string, null>('startChatWithContact');
export const joinChatWithContact = defineSignal<[ChatInfo]>('joinChatWithContact');
export const getNotifications = defineQuery<ChatNotification[], null>('getNotifications');
export const newMessageInChat = defineSignal<[NewMessageInChatRequest]>('newMessageInChat');

export const getDescription = defineQuery<ChatWorkflowRequest, null>('getDescription');
export const getDescriptionForUser = defineQuery<string, [string]>('getDescriptionForUser');
export const sendMessage = defineSignal<[SendMessageRequest]>('sendMessage');
