import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';
import { NotificationType } from '../../domain/notification.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_SOCKET_EVENTS,
  type MessageReactionEventPayload,
} from './notification.event';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly websocketService: WebsocketService,
  ) { }

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
      const content = `${reactorName} đã thả ${emoji} vào tin nhắn của bạn`.trim();

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

      // emit event socket 
      this.websocketService.server
        ?.to(recipientId)
        ?.emit(NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION, notification);
    } catch (error) {
      this.logger.error('Error handling message.reaction event', error);
    }
  }
}
