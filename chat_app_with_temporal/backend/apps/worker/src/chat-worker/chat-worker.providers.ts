import { Worker } from '@temporalio/worker';
import { taskQueue } from '@app/shared';

export const ChatWorkerProviders = [
  {
    provide: 'MSG_WORKER',
    inject: [],
    useFactory: async () => {
      const workflowOption = { workflowsPath: require.resolve('../temporal/workflows') };

      const worker = await Worker.create({
        taskQueue,
        ...workflowOption,
      });

      worker.run();
      console.log('Started worker!');

      return worker;
    },
  },
];
