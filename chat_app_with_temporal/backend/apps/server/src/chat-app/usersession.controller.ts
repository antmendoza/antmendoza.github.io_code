import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { AckNotificationsInChatRequest, UserSession } from '@app/shared';

@Controller('user-sessions')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Post('start-session/:userId')
  async startUserSession(@Param('userId') userId: string): Promise<any> {
    const sessionId = await this.userSessionService.startUserSession(userId);
    return { sessionId: sessionId };
  }

  @Get(':userId')
  async getSessionInfo(@Param('userId') userId: string): Promise<UserSession> {
    return await this.userSessionService.getSessionInfo(userId);
  }

  @Post(':userId/add-contact')
  async addContact(@Param('userId') userId: string, @Body() contact: { contact: string }): Promise<void> {
    await this.userSessionService.addContactToChat(userId, contact.contact);
    return;
  }

  @Post(':userId/start-chat')
  async startChatWithContact(@Param('userId') userId: string, @Body() contact: { contact: string }): Promise<void> {
    await this.userSessionService.startChatWithContact(userId, contact.contact);
    return;
  }

  @Post(':userId/ack-notifications')
  async ackNotifications(
    @Param('userId') userId: string,
    @Body() request: AckNotificationsInChatRequest,
  ): Promise<void> {

    console.log('ackNotificationsInChat', userId, request);
    await this.userSessionService.ackNotificationsInChat(userId, request);
  }
}
