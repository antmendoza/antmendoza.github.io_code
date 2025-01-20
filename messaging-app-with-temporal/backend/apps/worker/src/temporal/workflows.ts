import { setHandler, sleep, defineQuery } from '@temporalio/workflow';

import { getMessagesQuery } from '../../../../libs/shared/src';

export const getLanguages = defineQuery<string[]>('getLanguages');

export async function msgWorkflow(): Promise<void> {
  const msgs = [{ sender: 'Alice', content: 'Hello, Bob!' }];
  setHandler(getMessagesQuery, () => msgs);
  console.log('msgWorkflow started');
  await sleep(1000);
}
