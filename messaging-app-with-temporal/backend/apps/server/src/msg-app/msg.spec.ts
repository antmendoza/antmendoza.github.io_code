import { Test, TestingModule } from '@nestjs/testing';
import { MsgService } from './msg.service';
import { msgProviders } from './msg.providers';

describe('ExchangeRatesService', () => {
  let app: TestingModule;
  const rates = { AUD: 1.5 };

  beforeAll(async () => {
    const handleMock = {
      query: jest.fn(() => rates),
    };

    app = await Test.createTestingModule({
      providers: [...msgProviders, MsgService],
    })
      .overrideProvider('CONNECTION')
      .useValue(null)
      .overrideProvider('WORKFLOW_CLIENT')
      .useValue(null)
      .overrideProvider('MSG_WORKFLOW_HANDLE')
      .useValue(handleMock)
      .compile();
  });

  describe('ExchangeRatesService', () => {
    it('should return exchange rates', async () => {
      const exchangeRatesService = app.get(MsgService);

      const rates = await exchangeRatesService.getExchangeRates();

      expect(rates).toEqual({ AUD: 1.5 });
    });
  });
});
