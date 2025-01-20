import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Runtime, DefaultLogger, Worker } from '@temporalio/worker';
import { Client, WorkflowHandle } from '@temporalio/client';
import { getMessagesQuery } from '@app/shared';
import { msgWorkflow } from './workflows';
import { setTimeout } from 'timers/promises';

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
      handle = await client.workflow.start(msgWorkflow, {
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

  it('allows querying the list of messages', async function () {
    const handle = await execute();
    // This generally takes less than one second, but allow up to 5 seconds for slow CI environments
    await setTimeout(5000);
    const result = await handle.query(getMessagesQuery);
    expect(result).toEqual([]);
  });
});
