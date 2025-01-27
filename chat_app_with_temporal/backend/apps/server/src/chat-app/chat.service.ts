import { Inject, Injectable } from '@nestjs/common';
import { Client, WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { CHAT_TASK_QUEUE, getChatList, UserSessionRequest } from '@app/shared';
import { createUserWorkflowIdFromUserId, userSessionWorkflow } from '../../../worker/src/temporal/workflows';

@Injectable()
export class ChatService {
  constructor(@Inject('WORKFLOW_CLIENT') private client: Client) {}

  async getChatList(userId: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).query(getChatList);
  }

  async startUserSession(userId: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);

    try {
      const userSession: UserSessionRequest = {
        userId: userId,
        contacts: [],
        chats: [],
      };

      console.log('workflow id: ' + workflowId);

      await this.client.workflow.start(userSessionWorkflow, {
        taskQueue: CHAT_TASK_QUEUE,
        workflowId: workflowId,
        args: [userSession],
      });
      console.log('Started new workflow');
    } catch (err) {
      if (err instanceof WorkflowExecutionAlreadyStartedError) {
        console.log('Reusing existing workflow');
      } else {
        throw err;
      }
    }

    return workflowId;
  }
}
