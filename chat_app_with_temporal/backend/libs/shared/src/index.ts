import { defineQuery, defineSignal, defineUpdate } from '@temporalio/workflow';
import {
  AckNotificationsInChatRequest,
  ChatInfo,
  ChatWorkflowInfo,
  GetNotificationsResponse,
  JoinChatWithContactRequest,
  NotifyNewMessageRequest,
  SendMessageRequest,
  UserSession,
} from '@app/shared/types';

export const CHAT_TASK_QUEUE = 'chat-taskqueue';

export const getSessionInfo = defineQuery<UserSession, null>('getSessionInfo');
export const addContact = defineUpdate<string, null>('addContact');
export const startChatWithContact = defineUpdate<string, null>('startChatWithContact');
export const joinChatWithContact = defineSignal<[JoinChatWithContactRequest]>('joinChatWithContact');
export const notifyNewMessage = defineSignal<[NotifyNewMessageRequest]>('newMessageInChat');
export const ackNotificationsInChat = defineUpdate<[AckNotificationsInChatRequest], null>('ackNotifications');

export const getDescription = defineQuery<ChatWorkflowInfo, null>('getDescription');
export const getDescriptionForUser = defineQuery<string, [string]>('getDescriptionForUser');
export const sendMessage = defineSignal<[SendMessageRequest]>('sendMessage');

export * from './types';
