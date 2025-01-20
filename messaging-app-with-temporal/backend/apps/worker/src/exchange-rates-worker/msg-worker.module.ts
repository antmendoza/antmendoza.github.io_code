import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MsgWorkerProviders } from './msg-worker.providers';
import { MsgWorkerService } from './msg-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [...MsgWorkerProviders, MsgWorkerService],
})
export class MsgWorkerModule {}
