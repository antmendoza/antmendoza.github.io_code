import { Inject, Injectable } from '@nestjs/common';
import { Client, WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import {
  ackNotificationsInChat,
  AckNotificationsInChatRequest,
  addContact,
  CHAT_TASK_QUEUE,
  getSessionInfo,
  startChatWithContact,
  UserSession,
} from '@app/shared';
import {
  createUserWorkflowIdFromUserId,
  extractUserFromWorkflowId,
  userWorkflow,
} from '../../../worker/src/temporal/workflows';

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

  async ackNotificationsInChat(userId: string, request: AckNotificationsInChatRequest) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).executeUpdate(ackNotificationsInChat, { args: [request] });
  }

  async startChatWithContact(userId: string, contact: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);
    return await this.client.workflow.getHandle(workflowId).executeUpdate(startChatWithContact, { args: [contact] });
  }

  async listUsers() {
    const list = await this.client.workflowService.listWorkflowExecutions({
      namespace: 'default',
      query: "WorkflowType = 'userWorkflow'  AND `ExecutionStatus`='Running'",
    });

    const users = list.executions.map((e) => {
      return extractUserFromWorkflowId(e.execution.workflowId);
    });

    return users;
  }

  async startUserSession(userId: string) {
    const workflowId = createUserWorkflowIdFromUserId(userId);

    try {
      const userSession: UserSession = {
        userId: userId,
        contacts: [],
        chats: [],
      };

      console.log('Starting workflow id: ' + workflowId);

      await this.client.workflow.start(userWorkflow, {
        taskQueue: CHAT_TASK_QUEUE,
        workflowId: workflowId,
        args: [userSession],
      });
      console.log('Started new workflow: ' + workflowId);
    } catch (err) {
      if (err instanceof WorkflowExecutionAlreadyStartedError) {
        console.log('Reusing existing workflow: ' + workflowId);
      } else {
        throw err;
      }
    }

    return workflowId;
  }
}
