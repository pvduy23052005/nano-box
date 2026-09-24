import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';
import { NotificationType } from '../../domain/notification.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_SOCKET_EVENTS,
} from './notification.event';
import { type MessageCreatedEventPayload } from './notification.event';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly websocketService: WebsocketService,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.MESSAGE_CREATED)
  async handleMessageCreated(
    payload: MessageCreatedEventPayload,
  ): Promise<void> {
    try {
      const { message, memberIds } = payload;

      if (!message || !memberIds?.length) return;

      const recipientIds = memberIds.filter(
        (memberId) => memberId !== message.senderId,
      );

      if (!recipientIds.length) return;

      const title = `${payload.senderName} đã gửi một tin nhắn`;
      const content =
        message.content ||
        (message.attachments?.length ? '[Tệp đính kèm]' : '');

      await Promise.all(
        recipientIds.map(async (recipientId) => {
          const notification = await this.createNotificationUseCase.execute({
            recipientId,
            senderId: message.senderId,
            type: NotificationType.NEW_MESSAGE,
            title,
            content,
            metadata: {
              roomId: message.roomId,
              messageId: message.id,
            },
          });

          // emit event
          this.websocketService.server
            ?.to(recipientId)
            ?.emit(
              NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
              notification,
            );
        }),
      );
    } catch (error) {
      this.logger.error('Error handling message.created event', error);
    }
  }
}
