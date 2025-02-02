import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSession } from '@app/shared';

@Controller('user-sessions')
export class UserSessionController {
  constructor(private readonly chatService: UserSessionService) {}

  @Post('start-session/:userId')
  async startUserSession(@Param('userId') userId: string): Promise<any> {
    const sessionId = await this.chatService.startUserSession(userId);
    return { sessionId: sessionId };
  }

  @Get(':userId')
  async getSessionInfo(@Param('userId') userId: string): Promise<UserSession> {
    return await this.chatService.getSessionInfo(userId);
  }

  //create post method that to add contact to chat that has the userid as part of the url and the contactId as part of the body
  @Post(':userId/add-contact')
  async addContact(@Param('userId') userId: string, @Body() contact: { contact: string }): Promise<void> {
    await this.chatService.addContactToChat(userId, contact.contact);
    return;
  }


  @Post(':userId/start-chat')
  async startChatWithContact(@Param('userId') userId: string, @Body() contact: { contact: string }): Promise<void> {
    await this.chatService.startChatWithContact(userId, contact.contact);
    return;
  }

}
