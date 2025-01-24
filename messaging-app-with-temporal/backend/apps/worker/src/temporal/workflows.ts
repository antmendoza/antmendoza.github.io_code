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
  addContact,
  ChatInfo,
  ChatNotification,
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
  const chats: ChatInfo[] = [];

  const pendingChats: PendingChat[] = [];

  const notifications: ChatNotification[] = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, async (userId: string) => {
    pendingChats.push({ chatId: `chatId-${uuid4()}`, userId: userId });

    await condition(
      () => chats.length > 0,
      //        chats.indexOf(contact) >= 0
    );

    return null;
  });

  setHandler(joinChatWithContact, (chatInfo: ChatInfo) => {
    chats.push(chatInfo);
    console.log(`Joined chat with ${JSON.stringify(chatInfo)}`);
    return null;
  });

  setHandler(newMessageInChat, (request: NewMessageInChatRequest) => {
    console.log('newMessageInChatRequest', JSON.stringify(request));
    const chatId = request.chatId;

    //TODO improve
    let notification = notifications.filter((n) => n.chatId == chatId)[0];

    if (notification) {
      notification.pendingMessages = notification.pendingMessages + 1;
    } else {
      notification = {
        chatId,
        pendingMessages: 1,
      };
    }

    notifications.push(notification);
  });

  setHandler(getContactList, () => contacts);
  setHandler(getNotifications, () => notifications);
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

  await sleep(10000);
}

export function createUserWorkflowIdFromUserId(userId: string) {
  return `user-workflow-${userId}`;
}
