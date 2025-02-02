import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('users')
export class UserController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  async getUsers(): Promise<any> {
    return new Promise((resolve) => {
      resolve({
        users: ['user_1', 'user_2'],
      });
    });
  }
}
