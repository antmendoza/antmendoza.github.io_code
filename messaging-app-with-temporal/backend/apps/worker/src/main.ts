import { NestFactory } from '@nestjs/core';
import { MsgWorkerModule } from './msg-worker/msg-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(MsgWorkerModule);
  await app.listen(3001);
}
bootstrap();
