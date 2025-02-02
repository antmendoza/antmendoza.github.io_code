import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { chatProviders } from './chat.providers';
import { UserController } from './user.controller';
import { UserSessionController } from './usersession.controller';
import {ChatController} from "./chat.controller";

@Module({
  imports: [],
  controllers: [UserSessionController, ChatController, UserController],
  providers: [...chatProviders, ChatService],
})
export class ChatModule {}
