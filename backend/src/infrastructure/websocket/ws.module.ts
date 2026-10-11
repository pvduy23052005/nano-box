import { Module, Global, forwardRef } from '@nestjs/common';
import { WebsocketService } from './ws.service';
import { WebsocketGateway } from './ws.gateway';
import { PresenceService } from './presence.service';
import { RoomModule } from 'src/modules/room/room.module';
import { FriendshipModule } from 'src/modules/friendship/friendship.module';

@Global()
@Module({
  imports: [forwardRef(() => RoomModule), forwardRef(() => FriendshipModule)],
  providers: [WebsocketService, WebsocketGateway, PresenceService],
  exports: [WebsocketService, PresenceService],
})
export class WebsocketModule {}
