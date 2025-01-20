import { Module } from '@nestjs/common';
import { MsgModule } from './msg-app/msg.module';
@Module({
  imports: [MsgModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
