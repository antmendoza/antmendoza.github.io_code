import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ChatModule } from './chat.module';
import { ChatService } from './chat.service';

describe('chats', () => {
  let app: INestApplication;
  const chatService = { getChatList: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ChatModule],
    })
      .overrideProvider(ChatService)
      .useValue(chatService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET notifications`, () => {
    return request(app.getHttpServer()).get('/chats').expect(200).expect({
      data: chatService.getChatList(),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
