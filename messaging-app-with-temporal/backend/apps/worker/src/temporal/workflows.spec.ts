import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { Client, WorkflowHandle, WorkflowExecutionStatusName } from '@temporalio/client';
import { addContact, getChatList, getContactList, startChatWithContact } from '@app/shared';
import { userWorkflow } from './workflows';

const taskQueue = 'test-msgs';

describe('example workflow', function () {
  let client: Client;
  let handle: WorkflowHandle;
  let shutdown: () => Promise<void>;
  let execute: () => Promise<WorkflowHandle>;
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
    /* eslint-disable @typescript-eslint/no-empty-function */
    await client.workflow
      .getHandle('msg-workflow')
      .terminate()
      .catch(() => {});

    execute = async () => {
      handle = await client.workflow.start(userWorkflow, {
        taskQueue,
        workflowExecutionTimeout: 10_000,
        workflowId: 'msg-workflow',
      });
      return handle;
    };
  });

  afterAll(async () => {
    await shutdown();

    await env.teardown();
  });

  afterEach(async () => {
    await handle.terminate();
  });

  it('get list of contacts', async function () {
    const handle = await execute();
    expect((await handle.query(getContactList)).length).toEqual(0);

    await handle.executeUpdate(addContact, { args: ['jose'] });
    expect((await handle.query(getContactList)).length).toEqual(1);
  });

  it('get list of chats', async function () {
    client = env.client;

    const handle = await execute();
    expect((await handle.query(getChatList)).length).toEqual(0);

    await handle.executeUpdate(addContact, { args: ['jose'] });
    expect((await handle.query(getContactList)).length).toEqual(1);

    await handle.executeUpdate(startChatWithContact, { args: ['jose'] });
    expect((await handle.query(getChatList)).length).toEqual(1);

    const chatWithJose = client.workflow.getHandle('chat-with-jose');
    const chatWithJoseStatus = await chatWithJose.describe().then((w) => w.status.name);
    expect(chatWithJoseStatus).toEqual('RUNNING');
  });
});
