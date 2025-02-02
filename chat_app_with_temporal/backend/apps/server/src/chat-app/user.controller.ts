import { Controller, Get } from '@nestjs/common';
import { UserSessionService } from './user-session.service';

@Controller('users')
export class UserController {
  constructor(private readonly chatService: UserSessionService) {}

  @Get('')
  async getUsers(): Promise<any> {
    return new Promise((resolve) => {
      resolve({
        users: ['user_1', 'user_2'],
      });
    });
  }
}
