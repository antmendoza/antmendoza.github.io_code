import { condition, setHandler, sleep } from '@temporalio/workflow';

import { addContact, getContactList, getChatList, startChatWithContact } from '../../../../libs/shared/src';

export async function userWorkflow(): Promise<void> {
  const contacts = [];
  const chats = [];
  const pendingChats = [];

  setHandler(addContact, (contact: string) => {
    contacts.push(contact);
    return null;
  });

  setHandler(startChatWithContact, (contact: string) => {
    contacts.push(contact);
    pendingChats.push(contact);
    return null;
  });

  setHandler(getContactList, () => contacts);
  setHandler(getChatList, () => chats);

  while (true) {
    await condition(() => pendingChats.length > 0);
    const pendingChat = pendingChats.pop();

    chats.push(pendingChat);
  }

  console.log('msgWorkflow started');
  await sleep(10000);
}
