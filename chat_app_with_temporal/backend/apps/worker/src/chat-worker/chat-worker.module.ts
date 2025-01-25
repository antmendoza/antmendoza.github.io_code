import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatWorkerProviders } from './chat-worker.providers';
import { ChatWorkerService } from './chat-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [...ChatWorkerProviders, ChatWorkerService],
})
export class ChatWorkerModule {}
