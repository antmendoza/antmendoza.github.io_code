import { Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatInfo } from '@app/shared';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMsgList(): Promise<any> {
    const messages = await this.chatService.getChatList('test');

    if (messages === null) {
      return [];
    }

    return messages;
  }

  @Post('chats/start-session/:userId')
  async startUserSession(@Param('userId') userId: string): Promise<string> {
    return await this.chatService.startUserSession(userId);
  }

  @Get('chats/:userId')
  async getChats(@Param('userId') userId: string): Promise<ChatInfo[]> {
    return await this.chatService.getChatList(userId);
  }
}
