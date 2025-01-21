import { defineQuery, defineUpdate } from '@temporalio/workflow';

export const taskQueue = 'msg-taskqueue';

export type Message = {
  sender: string;
  content: string;
};

export const getChatList = defineQuery<Message[], null>('getChatList');
export const getContactList = defineQuery<string[], null>('getContactList');
export const addContact = defineUpdate<string, null>('addContact');
export const startChatWithContact = defineUpdate<string, null>('startChatWithContact');
