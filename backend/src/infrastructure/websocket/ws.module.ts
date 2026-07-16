import { Module, Global } from '@nestjs/common';
import { WebsocketService } from './ws.service';
import { WebsocketGateway } from './ws.gateway';

@Global()
@Module({
  providers: [WebsocketService, WebsocketGateway],
  exports: [WebsocketService],
})
export class WebsocketModule {}
