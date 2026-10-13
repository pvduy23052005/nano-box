import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { FRIENDSHIP_SOCKET_EVENTS } from '../gateway/friendship.event';
import {
  NOTIFICATION_EVENTS,
  type FriendRequestEventPayload,
} from 'src/modules/notification/presentation/listener/notification.event';

@Injectable()
export class FriendshipListener {
  private readonly logger = new Logger(FriendshipListener.name);

  constructor(private readonly websocketService: WebsocketService) {}

  @OnEvent(NOTIFICATION_EVENTS.FRIEND_REQUEST)
  handleFriendRequest(payload: FriendRequestEventPayload): void {
    try {
      const {
        requesterId,
        addresseeId,
        friendshipId,
        createdAt,
        requesterName,
        requesterAvatar,
        requesterEmail,
      } = payload;

      this.websocketService.server
        ?.to(addresseeId)
        ?.emit(FRIENDSHIP_SOCKET_EVENTS.FRIEND_REQUEST, {
          id: friendshipId,
          sender: {
            id: requesterId,
            name: requesterName,
            email: requesterEmail,
            avatar: requesterAvatar,
          },
          createdAt,
        });
    } catch (error) {
      this.logger.error('Error handling friendship.request event', error);
    }
  }
}
