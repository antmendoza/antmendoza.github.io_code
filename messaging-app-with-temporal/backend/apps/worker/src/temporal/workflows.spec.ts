import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { Client, WorkflowHandle } from '@temporalio/client';
import { addContact, getChatList, getContactList, startChatWithContact } from '@app/shared';
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
    /* eslint-disable @typescript-eslint/no-empty-function */
    await client.workflow
      .getHandle('msg-workflow')
      .terminate()
      .catch(() => {});

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
    await handle.terminate();
  });

  /////// userWorkflow ///////
  it('get list of contacts', async function () {
    const userWorkflowJuanHandler = await startUserWorkflow('juan');
    expect((await userWorkflowJuanHandler.query(getContactList)).length).toEqual(0);

    await userWorkflowJuanHandler.executeUpdate(addContact, { args: ['jose'] });
    expect((await userWorkflowJuanHandler.query(getContactList)).length).toEqual(1);
  });

  it('start chat', async function () {
    client = env.client;

    const userWorkflowJoseHandler = await startUserWorkflow('jose');
    const userWorkflowJuanHandler = await startUserWorkflow('juan');

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(0);
    expect((await userWorkflowJoseHandler.query(getChatList)).length).toEqual(0);

    await userWorkflowJuanHandler.executeUpdate(addContact, { args: ['jose'] });
    expect((await userWorkflowJuanHandler.query(getContactList))).toEqual(['jose']);

    await userWorkflowJuanHandler.executeUpdate(startChatWithContact, { args: ['jose'] });

    expect((await userWorkflowJuanHandler.query(getChatList)).length).toEqual(1);

    expect(await userWorkflowJoseHandler.describe().then((w) => w.status.name)).toEqual('RUNNING');


    expect((await userWorkflowJoseHandler.query(getChatList))).toEqual(["juan"]);

  });
});
