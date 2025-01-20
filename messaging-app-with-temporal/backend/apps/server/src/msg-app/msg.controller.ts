import { Controller, Get} from '@nestjs/common';
import { MsgService } from './msg.service';

@Controller('messaging')
export class MsgController {
  constructor(private readonly msgService: MsgService) {}

  @Get()
  async getMsgList(): Promise<any> {
    const messages = await this.msgService.getMessagesQuery();

    if (messages === null) {
      return [];
    }

    return messages;
  }
}
