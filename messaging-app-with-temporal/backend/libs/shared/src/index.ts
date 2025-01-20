import { defineQuery } from '@temporalio/workflow';

export const taskQueue = 'msg-taskqueue';

export type Message = {
  sender: string;
  content: string;
};

export const getMessagesQuery = defineQuery<Message[], null>('getMessagesQuery');
