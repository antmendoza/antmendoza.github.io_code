import { NestFactory } from '@nestjs/core';
import { ChatWorkerModule } from './chat-worker/chat-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatWorkerModule);
  await app.listen(3001);
}
bootstrap();
