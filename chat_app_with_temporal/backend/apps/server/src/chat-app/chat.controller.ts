import { Controller, Get} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat_controller')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMsgList(): Promise<any> {
    const messages = await this.chatService.getMessagesQuery();

    if (messages === null) {
      return [];
    }

    return messages;
  }
}
