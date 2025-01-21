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
  startChatWithContact,
} from '../../../../libs/shared/src';

export async function userWorkflow(): Promise<void> {
  const contacts = [];
  const chats = [];
  const pendingChats = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, (contact: string) => {
    pendingChats.push(contact);

    condition(() => chats.indexOf(contact) > 0);
    return null;
  });

  setHandler(joinChatWithContact, (contact: string) => {
    chats.push(contact);
    console.log(`Joined chat with ${contact}`);
    return null;
  });

  setHandler(getContactList, () => contacts);
  setHandler(getChatList, () => chats);

  while (true) {
    await condition(() => pendingChats.length > 0);
    const pendingChat = pendingChats.pop();

    const chatWithWorkflowId = `chat-with-${pendingChat}`;
    await startChild(chatWorkflow, {
      workflowId: chatWithWorkflowId,
      parentClosePolicy: ParentClosePolicy.ABANDON,
    });

    await getExternalWorkflowHandle(chatWithWorkflowId).signal(joinChatWithContact, pendingChat);

    chats.push(pendingChat);

  }

  console.log('msgWorkflow started');
  await sleep(10000);
}

export async function chatWorkflow(): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId}`);

  await sleep(10000);
}
