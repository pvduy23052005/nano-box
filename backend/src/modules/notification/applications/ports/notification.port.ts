import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationProps } from '../../domain/notification.type';

export interface NotificationPaginationParams {
  recipientId: string;
  limit?: number;
  cursor?: string;
}

export interface NotificationPaginationResult {
  items: NotificationProps[];
  nextCursor?: string | null;
  hasMore: boolean;
  unreadCount: number;
}

export abstract class NotificationRepositoryAdapter {
  abstract save(notification: NotificationEntity): Promise<NotificationProps>;
  abstract findById(notificationId: string): Promise<NotificationEntity | null>;
  abstract findByRecipientWithPagination(
    params: NotificationPaginationParams,
  ): Promise<NotificationPaginationResult>;
  abstract countUnreadByRecipient(recipientId: string): Promise<number>;
  abstract markAsRead(
    notificationId: string,
    recipientId: string,
  ): Promise<boolean>;
  abstract markAllAsRead(recipientId: string): Promise<boolean>;
}
