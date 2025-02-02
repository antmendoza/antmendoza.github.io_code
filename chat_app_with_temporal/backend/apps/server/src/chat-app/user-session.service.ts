import { Inject, Injectable } from '@nestjs/common';
import { Client, WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { addContact, CHAT_TASK_QUEUE, getSessionInfo, startChatWithContact, UserSession } from '@app/shared';
import { createUserWorkflowIdFromUserId, userSessionWorkflow } from '../../../worker/src/temporal/workflows';

@Injectable()
export class UserSessionService {
  constructor(@Inject('WORKFLOW_CLIENT') private client: Client) {}

  async getSessionInfo(userId: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).query(getSessionInfo);
  }

  async addContactToChat(userId: string, contact: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).executeUpdate(addContact, { args: [contact] });
  }

  async startChatWithContact(userId: string, contact: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).executeUpdate(startChatWithContact, { args: [contact] });
  }

  async startUserSession(userId: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);

    try {
      const userSession: UserSession = {
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
