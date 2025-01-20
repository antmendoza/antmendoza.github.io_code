import { Injectable, Inject } from '@nestjs/common';
import { Client, WorkflowHandle } from '@temporalio/client';
import { getMessagesQuery } from '@app/shared';

@Injectable()
export class MsgService {
  constructor(@Inject('MSG_WORKFLOW_HANDLE') private handle: WorkflowHandle) {}

  async getMessagesQuery() {
    return this.handle.query(getMessagesQuery);
  }
}

@Injectable()
export class ExchangeRatesClient extends Client {}
