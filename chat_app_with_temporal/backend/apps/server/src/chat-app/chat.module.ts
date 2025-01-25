import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { chatProviders } from './chat.providers';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [...chatProviders, ChatService],
})
export class ChatModule {}
