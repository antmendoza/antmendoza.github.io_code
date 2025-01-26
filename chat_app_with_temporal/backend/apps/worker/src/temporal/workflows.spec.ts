import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { Client, Workflow, WorkflowHandle } from '@temporalio/client';
import {
  ackNotificationsInChat,
  addContact,
  getChatList,
  getContactList,
  getDescription,
  getNotifications,
  sendMessage,
  startChatWithContact,
} from '@app/shared';
import { createUserWorkflowIdFromUserId, userSessionWorkflow } from './workflows';
import { setTimeout } from 'timers/promises';

const taskQueue = 'test-chats';

describe('chat workflow', function () {
  let client: Client;
  let handle: WorkflowHandle;
  let shutdown: () => Promise<void>;
  let startUserWorkflow: (user: string) => Promise<WorkflowHandle>;
  let env: TestWorkflowEnvironment;

  beforeAll(async function () {
    // Filter INFO log messages for clearer test output
    Runtime.install({ logger: new DefaultLogger('WARN') });
    env = await TestWorkflowEnvironment.createLocal();
    const worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('./workflows.ts'),
    });

    const runPromise = worker.run();
    shutdown = async () => {
      worker.shutdown();
      await runPromise;
    };
  });

  beforeEach(async () => {
    client = env.client;

    startUserWorkflow = async (user: string) => {
      handle = await client.workflow.start(userSessionWorkflow, {
        taskQueue,
        workflowExecutionTimeout: 10_000,
        workflowId: createUserWorkflowIdFromUserId(user),
        args: [
          {
            userId: user,
            contacts: [],
            chats: [],
          },
        ],
      });
      return handle;
    };
  });

  afterAll(async () => {
    await shutdown();

    await env.teardown();
  });

  afterEach(async () => {
    //await handle.terminate();
  });

  /////// userWorkflow ///////
  it('get list of contacts', async function () {
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflow(user1);
    expect((await userWorkflowUser1Handler.query(getContactList)).length).toEqual(0);

    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user2] });
    expect((await userWorkflowUser1Handler.query(getContactList)).length).toEqual(1);
  });

  it('start chat', async function () {
    client = env.client;

    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflow(user1);
    const userWorkflowUser2Handler = await startUserWorkflow(user2);

    expect((await userWorkflowUser1Handler.query(getChatList)).length).toEqual(0);
    expect((await userWorkflowUser2Handler.query(getChatList)).length).toEqual(0);

    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user2] });
    expect(await userWorkflowUser1Handler.query(getContactList)).toEqual([user2]);

    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user2] });

    expect((await userWorkflowUser1Handler.query(getChatList)).length).toEqual(1);

    expect((await userWorkflowUser2Handler.describe()).status.name).toEqual('RUNNING');

    expect((await userWorkflowUser2Handler.query(getChatList)).length).toEqual(1);
  });

  it('send message to chat', async function () {
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflow(user1);
    const userWorkflowUser2Handler = await startUserWorkflow(user2);

    expect((await userWorkflowUser1Handler.query(getChatList)).length).toEqual(0);
    expect((await userWorkflowUser2Handler.query(getChatList)).length).toEqual(0);

    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user2] });
    expect(await userWorkflowUser1Handler.query(getContactList)).toEqual([user2]);

    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user2] });

    expect((await userWorkflowUser1Handler.query(getChatList)).length).toEqual(1);

    expect((await userWorkflowUser2Handler.describe()).status.name).toEqual('RUNNING');

    const chatInfo = await userWorkflowUser2Handler.query(getChatList);
    expect(chatInfo.length).toEqual(1);

    const chatId = chatInfo[0].chatId;
    const chatHandler = client.workflow.getHandle(chatId);

    const chatDescription = await chatHandler.query(getDescription);

    expect(chatDescription.users.indexOf(user1) >= 0).toBeTruthy();
    expect(chatDescription.users.indexOf(user2) >= 0).toBeTruthy();

    //user2 send message
    await chatHandler.signal(sendMessage, {
      id: Math.random().toString(),
      content: `Hello, how are you?`,
      senderUserId: user2,
    });

    while ((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0]?.pendingNotifications == 0) {
      await setTimeout(50);
    }

    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler)).length).toEqual(1);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].chatId).toEqual(chatId);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(1);

    await chatHandler.signal(sendMessage, { id: Math.random().toString(), content: `👋`, senderUserId: user2 });
    while ((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].pendingNotifications == 1) {
      await setTimeout(50);
    }
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler)).length).toEqual(1);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].chatId).toEqual(chatId);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(2);

    await userWorkflowUser1Handler.executeUpdate(ackNotificationsInChat, { args: [{ chatId: chatId }] });
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler)).length).toEqual(0);
  });

  //test send messages to two chats
  it('send messages to two chats', async function () {
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();
    const user3 = 'pedro' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflow(user1);
    await startUserWorkflow(user2);
    await startUserWorkflow(user3);

    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user2] });
    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user3] });
    expect(await userWorkflowUser1Handler.query(getContactList)).toEqual([user2, user3]);

    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user2] });
    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user3] });

    const chatsUser1 = await userWorkflowUser1Handler.query(getChatList);
    expect(chatsUser1.length).toEqual(2);

    const chatHandler_1 = client.workflow.getHandle(chatsUser1[0].chatId);

    //user2 send message
    await chatHandler_1.signal(sendMessage, {
      id: Math.random().toString(),
      content: `Hello, how are you?`,
      senderUserId: user2,
    });

    const chatHandler_2 = client.workflow.getHandle(chatsUser1[1].chatId);

    //user3 send message
    await chatHandler_2.signal(sendMessage, {
      id: Math.random().toString(),
      content: `Hello, how are you?`,
      senderUserId: user3,
    });

    while ((await getNotificationsForWorkflow(userWorkflowUser1Handler)).length != 2) {
      await setTimeout(50);
    }

    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler)).length).toEqual(2);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(1);
    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[1].pendingNotifications).toEqual(1);

    await userWorkflowUser1Handler.executeUpdate(ackNotificationsInChat, {
      args: [{ chatId: (await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].chatId }],
    });

    expect((await getNotificationsForWorkflow(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(1);
  });
});

async function getNotificationsForWorkflow(userWorkflowUser1Handler: WorkflowHandle<Workflow>) {
  return await userWorkflowUser1Handler.query(getNotifications);
}
