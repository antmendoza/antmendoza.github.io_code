import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { chatProviders } from './chat.providers';
import { UserController } from './user.controller';
import { UserSessionController } from './usersession.controller';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DataInitializationService } from './data-initialization-service';

@Module({
  imports: [],
  controllers: [UserSessionController, ChatController, UserController],
  providers: [...chatProviders, UserSessionService, ChatService, DataInitializationService],
})
export class ChatModule {}
