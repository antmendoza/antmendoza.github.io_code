import { Controller, Get, Param } from '@nestjs/common';
import { ChatWorkflowInfo } from '@app/shared';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string): Promise<ChatWorkflowInfo> {
    return await this.chatService.getChatInfo(chatId);
  }
}
