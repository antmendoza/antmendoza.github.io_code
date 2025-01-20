import { Module } from '@nestjs/common';
import { ExchangeRatesController } from './msg.controller';
import { MsgService } from './msg.service';
import { msgProviders } from './msg.providers';

@Module({
  imports: [],
  controllers: [ExchangeRatesController],
  providers: [...msgProviders, MsgService],
})
export class MsgModule {}
