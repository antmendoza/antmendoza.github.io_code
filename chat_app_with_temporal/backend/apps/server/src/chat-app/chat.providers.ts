import { Provider } from '@nestjs/common';
import {
  Client,
  WorkflowExecutionAlreadyStartedError,
  Connection,
  ConnectionOptions,
  Workflow,
  WorkflowHandle,
} from '@temporalio/client';
import { taskQueue } from '@app/shared';

export const chatProviders: Provider[] = [
  {
    provide: 'CONNECTION_CONFIG',
    useValue: {
      address: 'localhost',
    } as ConnectionOptions,
  },
  {
    provide: 'CONNECTION',
    useFactory: async (config: ConnectionOptions) => {
      const connection = await Connection.connect(config);
      return connection;
    },
    inject: ['CONNECTION_CONFIG'],
  },
  {
    provide: 'WORKFLOW_CLIENT',
    useFactory: (connection: Connection) => {
      return new Client({ connection });
    },
    inject: ['CONNECTION'],
  },
  {
    provide: 'MSG_WORKFLOW_HANDLE',
    useFactory: async (client: Client) => {
      let handle: WorkflowHandle<Workflow>;
      try {
        handle = await client.workflow.start('chatWorkflow', {
          taskQueue,
          workflowId: 'my-chat-list',
        });
        console.log('Started new workflow');
      } catch (err) {
        if (err instanceof WorkflowExecutionAlreadyStartedError) {
          console.log('Reusing existing workflow');
          handle = client.workflow.getHandle('my-chat-list');
        } else {
          throw err;
        }
      }

      return handle;
    },
    inject: ['WORKFLOW_CLIENT'],
  },
];
