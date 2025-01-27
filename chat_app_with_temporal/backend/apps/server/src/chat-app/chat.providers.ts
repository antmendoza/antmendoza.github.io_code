import { Provider } from '@nestjs/common';
import {
  Client,
  WorkflowExecutionAlreadyStartedError,
  Connection,
  ConnectionOptions,
  Workflow,
  WorkflowHandle,
} from '@temporalio/client';
import { CHAT_TASK_QUEUE } from '@app/shared';

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
];
