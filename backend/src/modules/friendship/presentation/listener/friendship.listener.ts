import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import {
  FRIENDSHIP_SOCKET_EVENTS,
  FRIENDSHIP_INTERNAL_EVENTS,
  type FriendshipActionPayload,
} from '../gateway/friendship.event';
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
      this.logger.error(
        'Lỗi khi xử lý sự kiện gửi lời mời kết bạn (friendship.request)',
        error,
      );
    }
  }

  @OnEvent(FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_ACCEPTED)
  handleFriendRequestAccepted(payload: FriendshipActionPayload): void {
    try {
      this.websocketService.server
        ?.to(payload.targetId)
        ?.emit(FRIENDSHIP_SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, {
          id: payload.friendshipId,
          actorId: payload.actorId,
          targetId: payload.targetId,
          status: payload.status,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        });
    } catch (error) {
      this.logger.error(
        'Lỗi khi xử lý sự kiện chấp nhận kết bạn (friendship.request.accepted)',
        error,
      );
    }
  }

  @OnEvent(FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_CANCELLED)
  handleFriendRequestCancelled(payload: FriendshipActionPayload): void {
    try {
      this.websocketService.server
        ?.to(payload.targetId)
        ?.emit(FRIENDSHIP_SOCKET_EVENTS.FRIEND_REQUEST_CANCELLED, {
          id: payload.friendshipId,
          actorId: payload.actorId,
          targetId: payload.targetId,
        });
    } catch (error) {
      this.logger.error(
        'Lỗi khi xử lý sự kiện hủy lời mời kết bạn (friendship.request.cancelled)',
        error,
      );
    }
  }

  @OnEvent(FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_REJECTED)
  handleFriendRequestRejected(payload: FriendshipActionPayload): void {
    try {
      this.websocketService.server
        ?.to(payload.targetId)
        ?.emit(FRIENDSHIP_SOCKET_EVENTS.FRIEND_REQUEST_REJECTED, {
          id: payload.friendshipId,
          actorId: payload.actorId,
          targetId: payload.targetId,
        });
    } catch (error) {
      this.logger.error(
        'Lỗi khi xử lý sự kiện từ chối lời mời kết bạn (friendship.request.rejected)',
        error,
      );
    }
  }
}
