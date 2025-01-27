import { Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatInfo } from '@app/shared';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start-session/:userId')
  async startUserSession(@Param('userId') userId: string): Promise<any> {
    const sessionId = await this.chatService.startUserSession(userId);
    return { sessionId: sessionId };
  }

  @Get(':userId')
  async getChats(@Param('userId') userId: string): Promise<ChatInfo[]> {
    return await this.chatService.getChatList(userId);
  }
}
