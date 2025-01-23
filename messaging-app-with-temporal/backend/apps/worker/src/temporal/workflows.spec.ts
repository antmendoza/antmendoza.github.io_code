import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { Client, WorkflowHandle } from '@temporalio/client';
import { addContact, getChatList, getContactList, getDescription, startChatWithContact } from '@app/shared';
import { userWorkflow } from './workflows';

const taskQueue = 'test-msgs';

describe('example workflow', function () {
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
      handle = await client.workflow.start(userWorkflow, {
        taskQueue,
        workflowExecutionTimeout: 10_000,
        workflowId: 'user-workflow-[' + user + ']',
        args: [{ userId: user }],
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

    const userWorkflowJuanHandler = await startUserWorkflow(user1);
    expect((await userWorkflowJuanHandler.query(getContactList)).length).toEqual(0);

    await userWorkflowJuanHandler.executeUpdate(addContact, { args: [user2] });
    expect((await userWorkflowJuanHandler.query(getContactList)).length).toEqual(1);
  });

  it('start chat', async function () {
    client = env.client;

    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowJuanHandler = await startUserWorkflow(user1);
    const userWorkflowJoseHandler = await startUserWorkflow(user2);

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(0);
    expect((await userWorkflowJoseHandler.query(getChatList)).length).toEqual(0);

    await userWorkflowJuanHandler.executeUpdate(addContact, { args: [user2] });
    expect(await userWorkflowJuanHandler.query(getContactList)).toEqual([user2]);

    await userWorkflowJuanHandler.executeUpdate(startChatWithContact, { args: [user2] });

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(1);

    expect((await userWorkflowJoseHandler.describe()).status.name).toEqual('RUNNING');

    expect((await userWorkflowJoseHandler.query(getChatList)).length).toEqual(1);
  });

  it('send message to chat', async function () {
    const user1 = 'juan' + Math.random();
    const user2 = 'jose' + Math.random();

    const userWorkflowJuanHandler = await startUserWorkflow(user1);
    const userWorkflowJoseHandler = await startUserWorkflow(user2);

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(0);
    expect((await userWorkflowJoseHandler.query(getChatList)).length).toEqual(0);

    await userWorkflowJuanHandler.executeUpdate(addContact, { args: [user2] });
    expect(await userWorkflowJuanHandler.query(getContactList)).toEqual([user2]);

    await userWorkflowJuanHandler.executeUpdate(startChatWithContact, { args: [user2] });

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(1);

    expect((await userWorkflowJoseHandler.describe()).status.name).toEqual('RUNNING');

    const chatInfo = await userWorkflowJoseHandler.query(getChatList);
    expect(chatInfo.length).toEqual(1);

    const chatDescription = await client.workflow.getHandle(chatInfo[0].chatId).query(getDescription);

    expect(chatDescription.users.indexOf(user1) >= 0).toBeTruthy();
    expect(chatDescription.users.indexOf(user2) >= 0).toBeTruthy();

    //jose send message



    //juan getNotification

    //juan read message == ack notification

    // const msg_workflow = client.workflow.getHandle("msg-workflow");
  });
});
