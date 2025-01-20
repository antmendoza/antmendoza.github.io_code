import { Test, TestingModule } from '@nestjs/testing';
import { MsgService } from './msg.service';
import { msgProviders } from './msg.providers';

describe('MsgService', () => {
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

  describe('MsgService', () => {
    it('should return  rates', async () => {
      const msgService = app.get(MsgService);

      const rates = await msgService.getMessagesQuery();

      expect(rates).toEqual({ AUD: 1.5 });
    });
  });
});
