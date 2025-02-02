import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatWorkflowInfo, SendMessageRequest } from '@app/shared';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string): Promise<ChatWorkflowInfo> {
    return await this.chatService.getChatInfo(chatId);
  }

  @Post(':chatId/send-message')
  async sendMessage(@Param('chatId') chatId: string, @Body() request: SendMessageRequest): Promise<void> {
    await this.chatService.sendMessageToChat(chatId, request);
  }
}
