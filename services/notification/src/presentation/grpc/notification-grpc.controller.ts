import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';
import {
  NotificationProps,
  NotificationType,
} from '../../domain/notification.type';

interface MetadataPayload {
  roomId?: string;
  room_id?: string;
  messageId?: string;
  message_id?: string;
  action?: string;
}

interface CreateNotificationGrpcRequest {
  recipientId?: string;
  recipient_id?: string;
  senderId?: string;
  sender_id?: string;
  senderName?: string;
  sender_name?: string;
  senderAvatar?: string;
  sender_avatar?: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: MetadataPayload;
}

interface GrpcNotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: string;
  title: string;
  content: string;
  metadata: {
    roomId: string;
    messageId: string;
    action: string;
  };
  isRead: boolean;
  createdAt: string;
}

@Controller()
export class NotificationGrpcController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  private toGrpcItem(item: NotificationProps): GrpcNotificationItem {
    return {
      id: item.id ?? '',
      recipientId: item.recipientId,
      senderId: item.senderId,
      senderName: item.senderName ?? '',
      senderAvatar: item.senderAvatar ?? '',
      type: item.type,
      title: item.title,
      content: item.content,
      metadata: {
        roomId: item.metadata?.roomId ?? '',
        messageId: item.metadata?.messageId ?? '',
        action: item.metadata?.action ?? '',
      },
      isRead: item.isRead,
      createdAt: (item.createdAt ?? new Date()).toISOString(),
    };
  }

  @GrpcMethod('NotificationGrpcService', 'CreateNotification')
  async createNotification(
    data: CreateNotificationGrpcRequest,
  ): Promise<GrpcNotificationItem> {
    const saved = await this.createNotificationUseCase.execute({
      recipientId: data.recipientId ?? data.recipient_id ?? '',
      senderId: data.senderId ?? data.sender_id ?? '',
      senderName: (data.senderName ?? data.sender_name) || undefined,
      senderAvatar: (data.senderAvatar ?? data.sender_avatar) || undefined,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: {
        roomId: data.metadata?.roomId ?? data.metadata?.room_id ?? '',
        messageId:
          (data.metadata?.messageId ?? data.metadata?.message_id) || undefined,
        action: data.metadata?.action || undefined,
      },
    });

    return this.toGrpcItem(saved);
  }
}
