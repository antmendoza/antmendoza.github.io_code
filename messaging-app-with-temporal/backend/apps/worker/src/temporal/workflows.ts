import { condition, ParentClosePolicy, setHandler, sleep, startChild, workflowInfo } from '@temporalio/workflow';

import { addContact, getChatList, getContactList, startChatWithContact } from '../../../../libs/shared/src';

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

  setHandler(getContactList, () => contacts);
  setHandler(getChatList, () => chats);

  while (true) {
    await condition(() => pendingChats.length > 0);
    const pendingChat = pendingChats.pop();

    await startChild(chatWorkflow, {
      workflowId: `chat-with-${pendingChat}`,
      parentClosePolicy: ParentClosePolicy.ABANDON,
    });

    chats.push(pendingChat);
  }

  console.log('msgWorkflow started');
  await sleep(10000);
}

export async function chatWorkflow(): Promise<void> {
  console.log(`chatWorkflow started: ${workflowInfo().workflowId}`);

  await sleep(10000);
}
