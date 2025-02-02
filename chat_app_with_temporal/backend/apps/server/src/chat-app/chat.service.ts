import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { ChatWorkflowInfo, getDescription } from '@app/shared';

@Injectable()
export class ChatService {
  constructor(@Inject('WORKFLOW_CLIENT') private client: Client) {}

  async getChatInfo(chatId: string): Promise<ChatWorkflowInfo> {
    return await this.client.workflow.getHandle(chatId).query(getDescription);
  }
}
