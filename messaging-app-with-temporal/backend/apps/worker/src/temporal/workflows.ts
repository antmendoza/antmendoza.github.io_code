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
  ChatWorkflowRequest,
  ChatInfo,
  getChatList,
  getContactList,
  getDescriptionForUser,
  joinChatWithContact,
  startChatWithContact,
  UserWorkflowRequest,
  getDescription,
} from '../../../../libs/shared/src';

export type PendingChat = {
  chatId: string;
  userId: string;
};

export async function userWorkflow(userRequest: UserWorkflowRequest): Promise<void> {
  const contacts = [];
  const chats: ChatInfo[] = [];

  const pendingChats: PendingChat[] = [];

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

  setHandler(getContactList, () => contacts);
  setHandler(getChatList, () => {
    return chats;
  });

  while (true) {
    await condition(() => pendingChats.length > 0);
    const pendingChat = pendingChats.pop();

    //TODO review workflow id
    const chatWithWorkflowId = `chat-with-${uuid4()}`;
    const chatWorkflowHandler = await startChild(chatWorkflow, {
      workflowId: chatWithWorkflowId,
      parentClosePolicy: ParentClosePolicy.ABANDON,
      args: [{ users: [userRequest.userId, pendingChat.userId] }],
    });

    const workflowHandle = getExternalWorkflowHandle(`user-workflow-[${pendingChat.userId}]`);

    const chatInfo = {
      chatId: chatWorkflowHandler.workflowId,
    };

    await workflowHandle.signal(joinChatWithContact, chatInfo);

    chats.push(chatInfo);
  }

  await sleep(10000);
}

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

  await sleep(10000);
}
