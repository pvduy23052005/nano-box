import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationPaginationParams,
  NotificationPaginationResult,
  NotificationRepositoryAdapter,
} from '../applications/ports/notification.port';
import { NotificationEntity } from '../domain/notification.entity';
import {
  NotificationProps,
  NotificationType,
} from '../domain/notification.type';
import { Notification, NotificationDocument } from './notification.schema';

interface RawNotificationRecord {
  _id?: Types.ObjectId | string;
  recipient_id?: string;
  sender_id?: string;
  type?: NotificationType;
  title?: string;
  content?: string;
  metadata?: {
    room_id?: string;
    message_id?: string;
  };
  is_read?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class NotificationRepository implements NotificationRepositoryAdapter {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  private toPersistence(
    notification: NotificationEntity,
  ): Partial<Notification> {
    return {
      recipient_id: notification.getRecipientId(),
      sender_id: notification.getSenderId(),
      type: notification.getType(),
      title: notification.getTitle(),
      content: notification.getContent(),
      metadata: {
        room_id: notification.getMetadata().roomId,
        message_id: notification.getMetadata().messageId,
      },
      is_read: notification.getIsRead(),
    };
  }

  private toDTO(
    document: NotificationDocument | RawNotificationRecord,
  ): NotificationProps {
    const record: RawNotificationRecord =
      'toObject' in document && typeof document.toObject === 'function'
        ? document.toObject()
        : document;

    return {
      id: record._id?.toString() ?? '',
      recipientId: record.recipient_id ?? '',
      senderId: record.sender_id ?? '',
      type: record.type ?? NotificationType.NEW_MESSAGE,
      title: record.title ?? '',
      content: record.content ?? '',
      metadata: {
        roomId: record.metadata?.room_id ?? '',
        messageId: record.metadata?.message_id,
      },
      isRead: Boolean(record.is_read),
      createdAt: record.created_at,
    };
  }

  async save(notification: NotificationEntity): Promise<NotificationProps> {
    const persistenceData = this.toPersistence(notification);
    const created = new this.notificationModel(persistenceData);
    const saved = await created.save();
    return this.toDTO(saved);
  }

  async findById(notificationId: string): Promise<NotificationEntity | null> {
    if (!notificationId || !Types.ObjectId.isValid(notificationId)) return null;
    const doc = await this.notificationModel
      .findById(notificationId)
      .lean()
      .exec();
    if (!doc) return null;
    return NotificationEntity.restore(this.toDTO(doc));
  }

  async findByRecipientWithPagination({
    recipientId,
    limit = 10,
    cursor,
  }: NotificationPaginationParams): Promise<NotificationPaginationResult> {
    const safeLimit = Math.min(Math.max(Number(limit || 10), 1), 50);

    const filterQuery: Record<string, unknown> = {
      recipient_id: recipientId,
    };

    if (cursor && Types.ObjectId.isValid(cursor)) {
      filterQuery._id = { $lt: new Types.ObjectId(cursor) };
    }

    const [docs, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filterQuery)
        .sort({ _id: -1 })
        .limit(safeLimit + 1)
        .lean()
        .exec(),
      this.countUnreadByRecipient(recipientId),
    ]);

    const hasMore = docs.length > safeLimit;
    const itemsToReturn = hasMore ? docs.slice(0, safeLimit) : docs;

    const nextCursor =
      hasMore && itemsToReturn.length > 0
        ? itemsToReturn[itemsToReturn.length - 1]._id.toString()
        : null;

    return {
      items: itemsToReturn.map((doc) => this.toDTO(doc)),
      nextCursor,
      hasMore,
      unreadCount,
    };
  }

  async countUnreadByRecipient(recipientId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipient_id: recipientId,
      is_read: false,
    });
  }

  async markAsRead(
    notificationId: string,
    recipientId: string,
  ): Promise<boolean> {
    if (!notificationId || !Types.ObjectId.isValid(notificationId))
      return false;

    const result = await this.notificationModel.updateOne(
      { _id: new Types.ObjectId(notificationId), recipient_id: recipientId },
      { $set: { is_read: true } },
    );

    return result.matchedCount > 0;
  }

  async markAllAsRead(recipientId: string): Promise<boolean> {
    const result = await this.notificationModel.updateMany(
      { recipient_id: recipientId, is_read: false },
      { $set: { is_read: true } },
    );

    return result.acknowledged;
  }
}
