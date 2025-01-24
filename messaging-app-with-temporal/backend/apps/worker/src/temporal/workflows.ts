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
  ackNotifications,
  AckNotificationsRequest,
  addContact,
  ChatInfo,
  ChatWorkflowRequest,
  getChatList,
  getContactList,
  getDescription,
  getDescriptionForUser,
  getNotifications,
  joinChatWithContact,
  newMessageInChat,
  NewMessageInChatRequest,
  sendMessage,
  SendMessageRequest,
  startChatWithContact,
  UserWorkflowRequest,
} from '../../../../libs/shared/src';

export type PendingChat = {
  chatId: string;
  userId: string;
};

export async function userWorkflow(userRequest: UserWorkflowRequest): Promise<void> {
  const contacts = [];
  let chats: ChatInfo[] = [];

  //TODO
  const pendingChats: PendingChat[] = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    const chatId = `chatId-${uuid4()}`;
    pendingChats.push({ chatId: chatId, userId: userId });

    await sleep(1000);

    return null;
  });

  setHandler(joinChatWithContact, (chatInfo: ChatInfo) => {
    chats.push(chatInfo);
    console.log(`Joined chat with ${JSON.stringify(chatInfo)}`);
    return null;
  });

  setHandler(newMessageInChat, (request: NewMessageInChatRequest) => {
    console.log('newMessageInChatRequest', JSON.stringify(request));

    const updatedNotifications = chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = notification.pendingNotifications + 1;
      }

      return notification;
    });

    console.log('updatedNotifications', updatedNotifications);
    chats = updatedNotifications;
  });

  setHandler(ackNotifications, (request: AckNotificationsRequest) => {
    const updatedNotifications = chats.map((notification) => {
      if (notification.chatId == request.chatId) {
        notification.pendingNotifications = 0;
      }
      return notification;
    });

    console.log('updatedNotifications', updatedNotifications);
    chats = updatedNotifications;
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
    await condition(() => pendingChats.length > 0);

    //TODO add continue as new

    const pendingChat = pendingChats.pop();

    const targetWorkflowId = createUserWorkflowIdFromUserId(pendingChat.userId);

    //TODO review workflow id
    const chatWithWorkflowId = `chat-with-${uuid4()}`;
    const chatWorkflowHandler = await startChild(chatWorkflow, {
      workflowId: chatWithWorkflowId,
      parentClosePolicy: ParentClosePolicy.ABANDON,
      args: [
        {
          users: [userRequest.userId, pendingChat.userId],
          usersWorkflowId: [workflowInfo().workflowId, targetWorkflowId],
        },
      ],
    });

    const workflowHandle = getExternalWorkflowHandle(targetWorkflowId);

    const chatInfo = {
      chatId: chatWorkflowHandler.workflowId,
      pendingNotifications: 0,
    };

    await workflowHandle.signal(joinChatWithContact, chatInfo);

    chats.push(chatInfo);
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

        await getExternalWorkflowHandle(workflowId).signal(newMessageInChat, args);
      }
    }

    messagesHistory.push(message);
  }
}

export function createUserWorkflowIdFromUserId(userId: string) {
  return `user-workflow-${userId}`;
}
