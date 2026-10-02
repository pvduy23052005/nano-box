import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FRIENDSHIP_SOCKET_EVENTS } from '../gateway/friendship.event';
import { NOTIFICATION_EVENTS } from 'src/modules/notification/presentation/listener/notification.event';
import { type FriendRequestEventPayload } from 'src/modules/notification/presentation/listener/notification.event';

@Injectable()
export class FriendshipListener {
  private readonly logger = new Logger(FriendshipListener.name);

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly userRepository: UserRepositoryAdapter,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.FRIEND_REQUEST)
  async handleFriendRequest(payload: FriendRequestEventPayload): Promise<void> {
    try {
      const { requesterId, addresseeId, friendshipId, createdAt } = payload;

      const requester = await this.userRepository.findById(requesterId);
      if (!requester) return;

      const requesterName = requester.getName();
      const requesterAvatar = requester.getAvatar();
      const requesterEmail = requester.getEmail();

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
