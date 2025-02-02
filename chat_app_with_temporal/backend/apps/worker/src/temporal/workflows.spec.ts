import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { Client, Workflow, WorkflowHandle } from '@temporalio/client';
import {
  ackNotificationsInChat,
  addContact,
  getChatList,
  getContactList,
  getNotifications,
  sendMessage,
  startChatWithContact,
  UserSession,
} from '@app/shared';
import { createUserWorkflowIdFromUserId, userSessionWorkflow } from './workflows';
import { setTimeout } from 'timers/promises';

const taskQueue = 'test-chats';

describe('chat workflow', function () {
  let client: Client;
  let handle: WorkflowHandle;
  let shutdown: () => Promise<void>;
  let startUserWorkflowWithInput: (workflowInput: UserSession) => Promise<WorkflowHandle>;
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

    startUserWorkflowWithInput = async (workflowInput: UserSession) => {
      handle = await client.workflow.start(userSessionWorkflow, {
        taskQueue,
        workflowExecutionTimeout: 10_000,
        workflowId: createUserWorkflowIdFromUserId(workflowInput.userId),
        args: [workflowInput],
      });
      return handle;
    };
  });

  afterAll(async () => {
    await shutdown();

    await env.teardown();
  });

  afterEach(async () => {});

  /////// userWorkflow ///////
  it('get list of contacts', async function () {
    const user0 = 'antonio' + Math.random();
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflowWithInput({
      userId: user1,
      contacts: [user0],
      chats: [],
    });
    expect((await userWorkflowUser1Handler.query(getContactList)).length).toEqual(1);

    await userWorkflowUser1Handler.executeUpdate(addContact, { args: [user2] });
    expect((await userWorkflowUser1Handler.query(getContactList)).length).toEqual(2);
  });

  it('start chat', async function () {
    client = env.client;

    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflowWithInput({
      userId: user1,
      contacts: [user2],
      chats: [],
    });
    const userWorkflowUser2Handler = await startUserWorkflowWithInput({
      userId: user2,
      contacts: [user1],
      chats: [],
    });

    expect((await _getChats(userWorkflowUser1Handler)).length).toEqual(0);

    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user2] });
    expect((await _getChats(userWorkflowUser1Handler)).length).toEqual(1);
    expect(
      (await client.workflow.getHandle((await _getChats(userWorkflowUser1Handler))[0].chatId).describe()).status.name,
    ).toEqual('RUNNING');
    expect((await _getChats(userWorkflowUser2Handler)).length).toEqual(1);
  });

  it('send messages to two chats', async function () {
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();
    const user3 = 'pedro' + Math.random();

    const userWorkflowUser1Handler = await startUserWorkflowWithInput({
      userId: user1,
      contacts: [user2, user3],
      chats: [],
    });
    await startUserWorkflowWithInput({
      userId: user2,
      contacts: [user1],
      chats: [],
    });
    await startUserWorkflowWithInput({
      userId: user3,
      contacts: [user1],
      chats: [],
    });

    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user2] });
    await userWorkflowUser1Handler.executeUpdate(startChatWithContact, { args: [user3] });

    const chatsUser1 = await userWorkflowUser1Handler.query(getChatList);
    expect(chatsUser1.length).toEqual(2);

    const user1_chatHandler_with_user2 = client.workflow.getHandle(chatsUser1[0].chatId);

    //user2 send message
    await user1_chatHandler_with_user2.signal(sendMessage, {
      id: Math.random().toString(),
      content: `Hello, how are you?`,
      senderUserId: user2,
    });

    const user1_chatHandler_with_user3 = client.workflow.getHandle(chatsUser1[1].chatId);
    while ((await _getNotifications(userWorkflowUser1Handler)).length != 1) {
      await setTimeout(50);
    }
    expect((await _getNotifications(userWorkflowUser1Handler)).length).toEqual(1);
    expect((await _getNotifications(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(1);

    //user3 send message
    await user1_chatHandler_with_user3.signal(sendMessage, {
      id: Math.random().toString(),
      content: `Hi! 👋`,
      senderUserId: user3,
    });
    await user1_chatHandler_with_user3.signal(sendMessage, {
      id: Math.random().toString(),
      content: `che cosa fai? 🤌`,
      senderUserId: user3,
    });

    while ((await _getNotifications(userWorkflowUser1Handler)).length != 2) {
      await setTimeout(50);
    }

    expect((await _getNotifications(userWorkflowUser1Handler)).length).toEqual(2);
    expect((await _getNotifications(userWorkflowUser1Handler))[1].pendingNotifications).toEqual(2);

    await userWorkflowUser1Handler.executeUpdate(ackNotificationsInChat, {
      args: [{ chatId: user1_chatHandler_with_user3.workflowId }],
    });

    expect((await _getNotifications(userWorkflowUser1Handler)).length).toEqual(1);
    expect((await _getNotifications(userWorkflowUser1Handler))[0].pendingNotifications).toEqual(1);
  });
});

async function _getNotifications(userWorkflowUser1Handler: WorkflowHandle<Workflow>) {
  return await userWorkflowUser1Handler.query(getNotifications);
}

async function _getChats(userWorkflowUser1Handler: WorkflowHandle<Workflow>) {
  return await userWorkflowUser1Handler.query(getChatList);
}
