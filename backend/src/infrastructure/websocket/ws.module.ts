import { Module, Global } from '@nestjs/common';
import { WebsocketService } from './ws.service';
import { WebsocketGateway } from './ws.gateway';
import { PresenceService } from './presence.service';

@Global()
@Module({
  providers: [WebsocketService, WebsocketGateway, PresenceService],
  exports: [WebsocketService, PresenceService],
})
export class WebsocketModule {}
