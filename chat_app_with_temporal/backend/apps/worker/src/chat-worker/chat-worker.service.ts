import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ChatWorkerService {
  constructor(@Inject('MSG_WORKER') private worker) {}

  async close() {
    await this.worker.close();
  }
}
