import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserSession } from '@app/shared';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}


}
