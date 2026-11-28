import { Global, Module } from '@nestjs/common';
import { RealtimePublisherService } from './realtime-publisher.service';

@Global()
@Module({
  providers: [RealtimePublisherService],
  exports: [RealtimePublisherService],
})
export class RealtimeModule {}
