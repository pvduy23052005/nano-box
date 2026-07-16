import { Module } from '@nestjs/common';
import { EventGateway } from './presentation/gateway/event.gateway';

@Module({
  providers: [EventGateway],
})
export class ChatModule {}
