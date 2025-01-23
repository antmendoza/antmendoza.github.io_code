import { defineQuery, defineSignal, defineUpdate } from '@temporalio/workflow';

export const taskQueue = 'msg-taskqueue';

export type Message = {
  sender: string;
  content: string;
};

export type ChatInfo = {
  chatId: string;
};

export type UserWorkflowRequest = {
  userId: string;
};

export type ChatWorkflowRequest = {
  users: string[];
};

export const getChatList = defineQuery<ChatInfo[], null>('getChatList');
export const getContactList = defineQuery<string[], null>('getContactList');
export const addContact = defineUpdate<string, null>('addContact');
export const startChatWithContact = defineUpdate<string, null>('startChatWithContact');
export const joinChatWithContact = defineSignal<[ChatInfo]>('joinChatWithContact');

export const getDescription = defineQuery<ChatWorkflowRequest, null>('getDescription');
export const getDescriptionForUser = defineQuery<string, [string]>('getDescriptionForUser');
