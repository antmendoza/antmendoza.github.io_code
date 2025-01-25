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
  AckNotificationsInChatRequest,
  addContact,
  ChatInfo,
  ChatWorkflowRequest,
  getChatList,
  getContactList,
  getDescription,
  getDescriptionForUser,
  getNotifications,
  joinChatWithContact,
  JoinChatWithContactRequest,
  Message,
  notifyNewMessage,
  NotifyNewMessageRequest,
  sendMessage,
  SendMessageRequest,
  startChatWithContact,
  UserSessionRequest,
} from '../../../../libs/shared/src';

/**
 * User workflow, responsible for managing user contacts and chats for a given user
 * @param session is the workflow state
 */
export async function userSessionWorkflow(session: UserSessionRequest): Promise<void> {
  const contacts = [];
  const chats: ChatInfo[] = [];

  setHandler(addContact, (contact: string) => {
    console.log(`[addContact] Adding contact: ${contact}`);
    if (!contacts.includes(contact)) {
      contacts.push(contact);
    }
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    console.log(`[startChatWithContact] userId: ${userId}`);

    const chatWithWorkflowId = `chat-${uuid4()}`;
    const chatInfo = {
      chatId: chatWithWorkflowId,
      pendingNotifications: 0,
      started: false,
      userId: userId,
    };
    chats.push(chatInfo);
    await condition(() => chatInfo.started);
    return null;
  });

  setHandler(joinChatWithContact, (request: JoinChatWithContactRequest) => {
    console.log(`[joinChatWithContact] Request ${JSON.stringify(request)}`);
    chats.push({
      chatId: request.chatId,
      pendingNotifications: 0,
      started: true,
      userId: request.userId,
    });
    return null;
  });

  setHandler(notifyNewMessage, (request: NotifyNewMessageRequest) => {
    console.log(`[notifyNewMessage] Request: ${JSON.stringify(request)}`);
    chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = notification.pendingNotifications + 1;
      }
      return notification;
    });
  });

  setHandler(ackNotificationsInChat, (request: AckNotificationsInChatRequest) => {
    console.log(`[ackNotificationsInChat] Request: ${JSON.stringify(request)}`);
    chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = 0;
      }
      return notification;
    });

    return null;
  });

  setHandler(getContactList, () => contacts);

  setHandler(getNotifications, () => {
    return chats
      .map((c) => {
        if (c.pendingNotifications > 0) {
          return { chatId: c.chatId, pendingNotifications: c.pendingNotifications };
        }
      })
      .filter((c) => c);
  });

  setHandler(getChatList, () => {
    return chats;
  });

  while (true) {
    await condition(() => chats.some((c) => !c.started));

    const pendingChat = chats.find((c) => !c.started);

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
    chats.map((c) => {
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

  const messages: Message[] = [];

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
    if (!messages.some((m) => m.id == request.id)) {
      messages.push({
        id: request.id,
        sender: request.senderUserId,
        content: request.content,
        processed: false,
      });
    }
  });

  while (true) {
    //TODO Continue as new
    await condition(() => messages.some((m) => !m.processed));

    const message = messages.find((m) => !m.processed);

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

    messages.map((m) => {
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
