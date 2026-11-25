import {
  NotificationMetadata,
  NotificationProps,
  NotificationType,
} from '../../domain/notification.type';

export interface CreateNotificationInput {
  recipientId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
}

export abstract class NotificationClientAdapter {
  abstract createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationProps>;
}
