import {
  condition,
  getExternalWorkflowHandle,
  ParentClosePolicy,
  setHandler,
  sleep,
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
  notifyNewMessage,
  NotifyNewMessageRequest,
  sendMessage,
  SendMessageRequest,
  startChatWithContact,
  UserSessionRequest,
} from '../../../../libs/shared/src';

export async function userWorkflow(session: UserSessionRequest): Promise<void> {
  const contacts = [];
  let chats: ChatInfo[] = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    const chatWithWorkflowId = `chat-${uuid4()}`;

    const chatInfo = {
      chatId: chatWithWorkflowId,
      pendingNotifications: 0,
      started: false,
      userId: userId,
    };

    chats.push(chatInfo);

    await sleep(1000);

    await condition(() => chatInfo.started);

    return null;
  });

  setHandler(joinChatWithContact, (request: JoinChatWithContactRequest) => {
    chats.push({
      chatId: request.chatId,
      pendingNotifications: 0,
      started: true,
      userId: request.userId,
    });
    console.log(`Joined chat with ${JSON.stringify(request)}`);
    return null;
  });

  setHandler(notifyNewMessage, (request: NotifyNewMessageRequest) => {
    console.log('notifyNewMessage', request);

    chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = notification.pendingNotifications + 1;
      }
      return notification;
    });
  });

  setHandler(ackNotificationsInChat, (request: AckNotificationsInChatRequest) => {
    chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = 0;
      }
      return notification;
    });

    return null;
  });

  setHandler(getContactList, () => contacts);
  setHandler(getNotifications, () =>
    chats.map((c) => {
      return { chatId: c.chatId, pendingNotifications: c.pendingNotifications };
    }),
  );
  setHandler(getChatList, () => {
    return chats;
  });

  while (true) {
    await condition(() => chats.some((c) => !c.started));

    const pendingChat = chats.find((c) => !c.started);

    console.log('processing chat', pendingChat);
    const targetWorkflowId = createUserWorkflowIdFromUserId(pendingChat.userId);

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

    const workflowHandle = getExternalWorkflowHandle(targetWorkflowId);

    await workflowHandle.signal(joinChatWithContact, {
      chatId: pendingChat.chatId,
      userId: session.userId,
    });

    // update c.started to true
    chats.map((c) => {
      if (c.chatId == pendingChat.chatId) {
        c.started = true;
      }
      return c;
    });
  }
}

export async function chatWorkflow(chatRequest: ChatWorkflowRequest): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId} with input ${JSON.stringify(chatRequest)}`);

  const pendingMessages: SendMessageRequest[] = [];
  const messagesHistory: SendMessageRequest[] = [];

  setHandler(getDescription, () => {
    return chatRequest;
  });

  setHandler(getDescriptionForUser, (userId: string) => {
    const usersInChat = chatRequest.users.filter((user) => {
      return user != userId;
    });

    return `chat with ${usersInChat}`;
  });

  setHandler(sendMessage, (message: SendMessageRequest) => {
    pendingMessages.push(message);
  });

  while (true) {
    //TODO Continue as new
    await condition(() => pendingMessages.length > 0);

    const message = pendingMessages.pop();

    console.log('processing message   ', message);

    //Notify users in the chat
    for (const user of chatRequest.users) {
      if (user != message.senderUserId) {
        const args = {
          chatId: workflowInfo().workflowId,
        };
        const workflowId = createUserWorkflowIdFromUserId(user);
        console.log('Signaling workflow   ', workflowId);

        await getExternalWorkflowHandle(workflowId).signal(notifyNewMessage, args);
      }
    }

    messagesHistory.push(message);
  }
}

export function createUserWorkflowIdFromUserId(userId: string) {
  return `user-workflow-${userId}`;
}
