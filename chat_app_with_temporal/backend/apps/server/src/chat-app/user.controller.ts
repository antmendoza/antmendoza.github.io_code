import { Controller, Get } from '@nestjs/common';
import { UserSessionService } from './user-session.service';

@Controller('users')
export class UserController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Get('')
  async getUsers(): Promise<any> {
    return await this.userSessionService.listUsers().then((users) => {
      return {
        users: users.sort(),
      };
    });
  }
}
