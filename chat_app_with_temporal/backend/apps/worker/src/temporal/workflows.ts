import {
  condition,
  getExternalWorkflowHandle,
  ParentClosePolicy,
  setHandler,
  startChild,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';

import {
  ackNotificationsInChat,
  addContact,
  CHAT_STATUS,
  ChatInfo,
  ChatWorkflowInfo,
  getDescription,
  getSessionInfo,
  joinChatWithContact,
  JoinChatWithContactRequest,
  Message,
  notifyNewMessage,
  NotifyNewMessageRequest,
  sendMessage,
  SendMessageRequest,
  startChatWithContact,
  UserSession,
} from '../../../../libs/shared/src';
import { AckNotificationsInChatRequest } from '@app/shared/types';

/**
 * User workflow, responsible for managing user contacts and chats for a given user
 * @param session is the workflow state
 */
export async function userWorkflow(session: UserSession): Promise<void> {
  setHandler(addContact, (contact: string) => {
    addContactToSession(contact);
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    //TODO add test, and move to validate
    if (!session.contacts.includes(userId)) {
      throw new Error(`User ${userId} is not a contact`);
    }

    if (session.chats.some((c) => c.userId == userId)) {
      console.log(`[startChatWithContact] Chat with ${userId} already started`);
      return;
    }

    console.log(`[startChatWithContact] userId: ${userId}`);
    const chatWithWorkflowId = `chat-${uuid4()}`;
    const chatInfo = {
      chatId: chatWithWorkflowId,
      pendingNotifications: 0,
      status: CHAT_STATUS.PENDING,
      userId: userId,
    };
    session.chats.push(chatInfo);
    await condition(() => chatInfo.status != CHAT_STATUS.PENDING);
    return null;
  });

  setHandler(joinChatWithContact, (request: JoinChatWithContactRequest) => {
    console.log(`[joinChatWithContact] Request ${JSON.stringify(request)}`);

    addContactToSession(request.userId);

    session.chats.push({
      chatId: request.chatId,
      pendingNotifications: 0,
      status: CHAT_STATUS.STARTED,
      userId: request.userId,
    });
    return null;
  });

  setHandler(notifyNewMessage, (request: NotifyNewMessageRequest) => {
    console.log(`[notifyNewMessage] Request: ${JSON.stringify(request)}`);
    session.chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = notification.pendingNotifications + 1;
      }
      return notification;
    });
  });

  setHandler(ackNotificationsInChat, (request: AckNotificationsInChatRequest) => {
    console.log(`[ackNotificationsInChat] Request: ${JSON.stringify(request)}`);
    session.chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = 0;
      }
      return notification;
    });

    return null;
  });

  setHandler(getSessionInfo, () => {
    return session;
  });

  while (true) {

    //TODO Continue as new

    await condition(() => session.chats.some((c) => isPending(c)));

    const pendingChat = session.chats.find((c) => isPending(c));

    console.log('Processing chat', pendingChat);
    const targetWorkflowId = createUserWorkflowIdFromUserId(pendingChat.userId);

    try {
      //Notify the user workflow to join the chat
      const workflowHandle = getExternalWorkflowHandle(targetWorkflowId);
      await workflowHandle.signal(joinChatWithContact, {
        chatId: pendingChat.chatId,
        userId: session.userId,
      });
      console.log(`User notified (targetWorkflowId: ${targetWorkflowId}) to join chat ${pendingChat.chatId}`);

      //Start chat workflow with the user
      await startChild(chatWorkflow, {
        workflowId: pendingChat.chatId,
        parentClosePolicy: ParentClosePolicy.ABANDON,
        args: [
          {
            users: [session.userId, pendingChat.userId],
            usersWorkflowId: [workflowInfo().workflowId, targetWorkflowId],
            messages: [],
          },
        ],
      });
      console.log('Chat workflow started with id', pendingChat.chatId);
      markChatAs(pendingChat, CHAT_STATUS.STARTED);

    } catch (e: any) {
      console.log(`Failed to start chat with ${pendingChat.userId}`, e);
      markChatAs(pendingChat, CHAT_STATUS.FAILED);
    }
  }

  function addContactToSession(contact: string) {
    if (!session.contacts.includes(contact)) {
      console.log(`[addContact] Adding contact: ${contact}`);
      session.contacts.push(contact);
    }
  }

  function markChatAs(pendingChat: ChatInfo, status: CHAT_STATUS) {
    session.chats.map((c) => {
      if (c.chatId == pendingChat.chatId) {
        c.status = status;
      }
      return c;
    });
  }

  function isPending(c: ChatInfo) {
    return c.status == CHAT_STATUS.PENDING;
  }
}

/**
 * Chat workflow, hold the chat messages and notify users when a new message is received
 * @param chatRequest
 */
export async function chatWorkflow(chatRequest: ChatWorkflowInfo): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId} with input ${JSON.stringify(chatRequest)}`);

  setHandler(getDescription, () => {
    return chatRequest;
  });

  setHandler(sendMessage, (request: SendMessageRequest) => {
    if (!chatRequest.messages.some((m) => m.id == request.id)) {
      chatRequest.messages.push({
        id: request.id,
        sender: request.senderUserId,
        content: request.content,
        processed: false,
        timestamp: request.timestamp,
      });
    }
  });

  while (true) {

    //TODO Continue as new
    await condition(() => chatRequest.messages.some((m) => !m.processed));

    const message: Message = chatRequest.messages.find((m) => !m.processed);

    console.log('processing message   ', message);

    //Notify users in the chat except the sender
    for (const user of chatRequest.users) {
      console.log('Processing user', user);
      console.log('Processing message.sender', message.sender);

      if (user != message.sender) {
        const workflowId = createUserWorkflowIdFromUserId(user);
        console.log('Sending notification [notifyNewMessage] to', workflowId);

        await getExternalWorkflowHandle(workflowId).signal(notifyNewMessage, {
          chatId: workflowInfo().workflowId,
        });
      }
    }

    chatRequest.messages.map((m) => {
      if (m.id == message.id) {
        m.processed = true;
      }
      return m;
    });
  }
}

const workflowIdPrefix = 'user-workflow-';
export function createUserWorkflowIdFromUserId(userId: string) {
  return `${workflowIdPrefix}${userId}`;
}

export function extractUserFromWorkflowId(workflowId: string) {
  return workflowId.replace(workflowIdPrefix, '');
}
