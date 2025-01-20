import { Module } from '@nestjs/common';
import { MsgController } from './msg.controller';
import { MsgService } from './msg.service';
import { msgProviders } from './msg.providers';

@Module({
  imports: [],
  controllers: [MsgController],
  providers: [...msgProviders, MsgService],
})
export class MsgModule {}
