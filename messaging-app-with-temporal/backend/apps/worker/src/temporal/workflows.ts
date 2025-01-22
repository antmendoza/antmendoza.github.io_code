import {
  condition,
  getExternalWorkflowHandle,
  ParentClosePolicy,
  setHandler,
  sleep,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';

import {
  addContact,
  getChatList,
  getContactList,
  joinChatWithContact,
  startChatWithContact, UserWorkflowRequest,
} from '../../../../libs/shared/src';




export async function userWorkflow(userRequest: UserWorkflowRequest): Promise<void> {


  const contacts = [];
  const chats = [];
  const pendingChats = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, async (contact: string) => {
    pendingChats.push(contact);
    await condition(() => chats.indexOf(contact) >= 0);
    return null;
  });

  setHandler(joinChatWithContact, (contact: string) => {
    chats.push(contact);
    console.log(`Joined chat with ${contact}`);
    return null;
  });

  setHandler(getContactList, () => contacts);
  setHandler(getChatList, () => {
    return chats;
  });

  while (true) {
    await condition(() => pendingChats.length > 0);
    const pendingChat = pendingChats.pop();

    const chatWithWorkflowId = `chat-with-${pendingChat}`;
    await startChild(chatWorkflow, {
      workflowId: chatWithWorkflowId,
      parentClosePolicy: ParentClosePolicy.ABANDON,
    });

    const workflowHandle = getExternalWorkflowHandle(`user-workflow-[${pendingChat}]`);
    await workflowHandle.signal(joinChatWithContact, userRequest.userId);

    chats.push(pendingChat);
  }

  await sleep(10000);
}

export async function chatWorkflow(): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId}`);

  await sleep(10000);
}
