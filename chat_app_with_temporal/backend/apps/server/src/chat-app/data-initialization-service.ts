import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserSessionService } from './user-session.service';

@Injectable()
export class DataInitializationService implements OnModuleInit {
  constructor(private readonly userSessionService: UserSessionService) {}

  async onModuleInit() {
    await this.initializeData();
  }

  private async initializeData() {
    // Add your data initialization logic here
    console.log('--------Initializing data--------');

    const users = ['user_1', 'user_2', 'user_3'];
    for (const user of users) {
      await this.userSessionService.startUserSession(user);
    }
    console.log('--------END Initializing data--------');
  }
}
