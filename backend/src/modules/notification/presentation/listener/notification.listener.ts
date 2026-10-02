import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';
import { NotificationType } from '../../domain/notification.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_SOCKET_EVENTS,
  type MessageReactionEventPayload,
  type FriendRequestEventPayload,
} from './notification.event';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly websocketService: WebsocketService,
    private readonly userRepository: UserRepositoryAdapter,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.MESSAGE_REACTION)
  async handleMessageReaction(
    payload: MessageReactionEventPayload,
  ): Promise<void> {
    try {
      const { message, reactorId, reactorName, reactorAvatar, emoji } = payload;

      if (!message || !reactorId || !reactorName) return;
      if (message.senderId === reactorId) return;

      const isReacted = message.reactions?.some(
        (reaction) =>
          reaction.emoji === emoji && reaction.userIds.includes(reactorId),
      );
      if (!isReacted) return;

      const title = `${reactorName}`;
      const content =
        `${reactorName} đã thả ${emoji} vào tin nhắn của bạn`.trim();

      const recipientId = message.senderId;

      const notification = await this.createNotificationUseCase.execute({
        recipientId,
        senderId: reactorId,
        senderName: reactorName,
        senderAvatar: reactorAvatar,
        type: NotificationType.REACTION,
        title,
        content,
        metadata: {
          roomId: message.roomId,
          messageId: message.id,
        },
      });

      this.websocketService.server
        ?.to(recipientId)
        ?.emit(NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION, notification);
    } catch (error) {
      this.logger.error('Error handling message.reaction event', error);
    }
  }

  @OnEvent(NOTIFICATION_EVENTS.FRIEND_REQUEST)
  async handleFriendRequest(payload: FriendRequestEventPayload): Promise<void> {
    try {
      const { requesterId, addresseeId, friendshipId } = payload;

      const requester = await this.userRepository.findById(requesterId);
      if (!requester) return;

      const requesterName = requester.getName();
      const requesterAvatar = requester.getAvatar();

      const title = 'Lời mời kết bạn mới';
      const content = `${requesterName} đã gửi cho bạn một lời mời kết bạn.`;

      const notification = await this.createNotificationUseCase.execute({
        recipientId: addresseeId,
        senderId: requesterId,
        senderName: requesterName,
        senderAvatar: requesterAvatar,
        type: NotificationType.FRIEND_REQUEST,
        title,
        content,
        metadata: {
          messageId: friendshipId,
        },
      });

      this.websocketService.server
        ?.to(addresseeId)
        ?.emit(NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION, notification);
    } catch (error) {
      this.logger.error('Error handling friend.request event', error);
    }
  }
}
