import { Controller, Get, Param } from '@nestjs/common';
import { MsgService } from './msg.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: MsgService) {}

  @Get(':currency')
  async getExchangeRates(@Param('currency') currency: []): Promise<any> {
    const rates = await this.exchangeRatesService.getMessagesQuery();

    if (rates === null) {
      return undefined;
    }

    return rates;
  }
}
