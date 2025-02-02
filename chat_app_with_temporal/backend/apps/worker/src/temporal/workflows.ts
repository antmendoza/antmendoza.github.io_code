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
  ChatWorkflowRequest,
  getChatList,
  getContactList,
  getDescription,
  getDescriptionForUser,
  getNotifications,
  getSessionInfo,
  joinChatWithContact,
  JoinChatWithContactRequest,
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
export async function userSessionWorkflow(session: UserSession): Promise<void> {
  setHandler(addContact, (contact: string) => {
    console.log(`[addContact] Adding contact: ${contact}`);
    if (!session.contacts.includes(contact)) {
      session.contacts.push(contact);
    }
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    //TODO check preconditions
    console.log(`[startChatWithContact] userId: ${userId}`);
    const chatWithWorkflowId = `chat-${uuid4()}`;
    const chatInfo = {
      chatId: chatWithWorkflowId,
      pendingNotifications: 0,
      started: false,
      userId: userId,
    };
    session.chats.push(chatInfo);
    await condition(() => chatInfo.started);
    return null;
  });

  setHandler(joinChatWithContact, (request: JoinChatWithContactRequest) => {
    console.log(`[joinChatWithContact] Request ${JSON.stringify(request)}`);
    session.chats.push({
      chatId: request.chatId,
      pendingNotifications: 0,
      started: true,
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

  setHandler(getContactList, () => session.contacts);

  setHandler(getNotifications, () => {
    return session.chats
      .map((c) => {
        if (c.pendingNotifications > 0) {
          return { chatId: c.chatId, pendingNotifications: c.pendingNotifications };
        }
      })
      .filter((c) => c);
  });

  setHandler(getChatList, () => {
    return session.chats;
  });

  setHandler(getSessionInfo, () => {
    return session;
  });

  while (true) {
    await condition(() => session.chats.some((c) => !c.started));

    const pendingChat = session.chats.find((c) => !c.started);

    console.log('Processing chat', pendingChat);
    const targetWorkflowId = createUserWorkflowIdFromUserId(pendingChat.userId);

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

    //Notify the user workflow to join the chat
    const workflowHandle = getExternalWorkflowHandle(targetWorkflowId);
    await workflowHandle.signal(joinChatWithContact, {
      chatId: pendingChat.chatId,
      userId: session.userId,
    });
    console.log(`User notified (targetWorkflowId: ${targetWorkflowId}) to join chat ${pendingChat.chatId}`);

    //Mark chat as started
    session.chats.map((c) => {
      if (c.chatId == pendingChat.chatId) {
        c.started = true;
      }
      return c;
    });
  }
}

/**
 * Chat workflow, hold the chat messages and notify users when a new message is received
 * @param chatRequest
 */
export async function chatWorkflow(chatRequest: ChatWorkflowRequest): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId} with input ${JSON.stringify(chatRequest)}`);

  setHandler(getDescription, () => {
    return chatRequest;
  });

  setHandler(getDescriptionForUser, (userId: string) => {
    const usersInChat = chatRequest.users.filter((user) => {
      return user != userId;
    });
    return `chat with ${usersInChat}`;
  });

  setHandler(sendMessage, (request: SendMessageRequest) => {
    if (!chatRequest.messages.some((m) => m.id == request.id)) {
      chatRequest.messages.push({
        id: request.id,
        sender: request.senderUserId,
        content: request.content,
        processed: false,
      });
    }
  });

  while (true) {
    //TODO Continue as new
    await condition(() => chatRequest.messages.some((m) => !m.processed));

    const message = chatRequest.messages.find((m) => !m.processed);

    console.log('processing message   ', message);

    //Notify users in the chat except the sender
    for (const user of chatRequest.users) {
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

export function createUserWorkflowIdFromUserId(userId: string) {
  return `user-workflow-${userId}`;
}
