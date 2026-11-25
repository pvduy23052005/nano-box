import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  CreateNotificationInput,
  NotificationClientAdapter,
} from '../../applications/ports/notification-client.port';
import {
  NotificationProps,
  NotificationType,
} from '../../domain/notification.type';

interface GrpcNotificationItem {
  id?: string;
  recipientId?: string;
  recipient_id?: string;
  senderId?: string;
  sender_id?: string;
  senderName?: string;
  sender_name?: string;
  senderAvatar?: string;
  sender_avatar?: string;
  type?: string;
  title?: string;
  content?: string;
  metadata?: {
    roomId?: string;
    room_id?: string;
    messageId?: string;
    message_id?: string;
    action?: string;
  };
  isRead?: boolean;
  is_read?: boolean;
  createdAt?: string;
  created_at?: string;
}

interface NotificationGrpcService {
  createNotification(
    data: Record<string, unknown>,
  ): Observable<GrpcNotificationItem>;
}

@Injectable()
export class GrpcNotificationAdapter
  implements NotificationClientAdapter, OnModuleInit
{
  private readonly logger = new Logger(GrpcNotificationAdapter.name);
  private notificationGrpcService!: NotificationGrpcService;

  constructor(
    @Inject('NOTIFICATION_GRPC_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.notificationGrpcService =
      this.client.getService<NotificationGrpcService>(
        'NotificationGrpcService',
      );
  }

  private mapGrpcItem(item: GrpcNotificationItem): NotificationProps {
    const rawCreatedAt = item.createdAt ?? item.created_at;
    return {
      id: item.id ?? '',
      recipientId: item.recipientId ?? item.recipient_id ?? '',
      senderId: item.senderId ?? item.sender_id ?? '',
      senderName: (item.senderName ?? item.sender_name) || undefined,
      senderAvatar: (item.senderAvatar ?? item.sender_avatar) || undefined,
      type: (item.type as NotificationType) ?? NotificationType.NEW_MESSAGE,
      title: item.title ?? '',
      content: item.content ?? '',
      metadata: {
        roomId: item.metadata?.roomId ?? item.metadata?.room_id ?? '',
        messageId:
          (item.metadata?.messageId ?? item.metadata?.message_id) || undefined,
        action: item.metadata?.action || undefined,
      },
      isRead: Boolean(item.isRead ?? item.is_read),
      createdAt: rawCreatedAt ? new Date(rawCreatedAt) : new Date(),
    };
  }

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationProps> {
    try {
      const response = await firstValueFrom(
        this.notificationGrpcService.createNotification({
          recipientId: input.recipientId,
          senderId: input.senderId,
          senderName: input.senderName ?? '',
          senderAvatar: input.senderAvatar ?? '',
          type: input.type,
          title: input.title,
          content: input.content,
          metadata: {
            roomId: input.metadata.roomId ?? '',
            messageId: input.metadata.messageId ?? '',
            action: input.metadata.action ?? '',
          },
        }),
      );
      return this.mapGrpcItem(response);
    } catch (error) {
      this.logger.error('gRPC createNotification failed', error);
      throw error;
    }
  }
}
