import { Worker } from '@temporalio/worker';
import { CHAT_TASK_QUEUE } from '@app/shared';

export const ChatWorkerProviders = [
  {
    provide: 'MSG_WORKER',
    inject: [],
    useFactory: async () => {
      const workflowOption = { workflowsPath: require.resolve('../temporal/workflows') };

      const worker = await Worker.create({
        taskQueue: CHAT_TASK_QUEUE,
        ...workflowOption,
      });

      worker.run();
      console.log('Started worker!');

      return worker;
    },
  },
];
