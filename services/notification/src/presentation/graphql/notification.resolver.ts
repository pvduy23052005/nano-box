import { UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetNotificationsUseCase } from '../../applications/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../../applications/use-cases/get-unread-count.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../../applications/use-cases/mark-all-notifications-as-read.use-case';
import { MarkNotificationAsReadUseCase } from '../../applications/use-cases/mark-notification-as-read.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  NotificationPayload,
  NotificationsPagePayload,
} from '../dto/notification.output';
import { AuthGuard } from '../guards/auth.guard';

@Resolver(() => NotificationPayload)
@UseGuards(AuthGuard)
export class NotificationResolver {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadNotificationCountUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase,
  ) {}

  @Query(() => NotificationsPagePayload)
  async getNotifications(
    @CurrentUser('id') recipientId: string,
    @Args('limit', { type: () => Float, nullable: true }) limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<NotificationsPagePayload> {
    const result = await this.getNotificationsUseCase.execute(
      recipientId,
      limit,
      cursor,
    );

    return {
      items: result.items.map((item) => ({
        id: item.id ?? '',
        recipientId: item.recipientId,
        senderId: item.senderId,
        senderName: item.senderName,
        senderAvatar: item.senderAvatar,
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: {
          roomId: item.metadata.roomId,
          messageId: item.metadata.messageId,
          action: item.metadata.action,
        },
        isRead: item.isRead,
        createdAt: item.createdAt ?? new Date(),
      })),
      nextCursor: result.nextCursor ?? undefined,
      hasMore: result.hasMore,
      unreadCount: result.unreadCount,
    };
  }

  @Query(() => Int)
  async getUnreadNotificationCount(
    @CurrentUser('id') recipientId: string,
  ): Promise<number> {
    return this.getUnreadCountUseCase.execute(recipientId);
  }

  @Mutation(() => Boolean)
  async markNotificationAsRead(
    @CurrentUser('id') recipientId: string,
    @Args('id', { type: () => String }) notificationId: string,
  ): Promise<boolean> {
    return this.markAsReadUseCase.execute(notificationId, recipientId);
  }

  @Mutation(() => Boolean)
  async markAllNotificationsAsRead(
    @CurrentUser('id') recipientId: string,
  ): Promise<boolean> {
    return this.markAllAsReadUseCase.execute(recipientId);
  }
}
