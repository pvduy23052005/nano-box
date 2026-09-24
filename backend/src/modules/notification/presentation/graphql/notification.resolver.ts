import { UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  NotificationPayload,
  NotificationsPagePayload,
} from '../dto/notification.output';
import { GetNotificationsUseCase } from '../../applications/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../../applications/use-cases/get-unread-count.use-case';
import { MarkNotificationAsReadUseCase } from '../../applications/use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../../applications/use-cases/mark-all-notifications-as-read.use-case';
import { GetMeUseCase } from 'src/modules/user/applications/use-case/get-me.use-case';

@Resolver(() => NotificationPayload)
@UseGuards(AuthGuard)
export class NotificationResolver {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly getMeUseCase: GetMeUseCase,
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
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: {
          roomId: item.metadata.roomId,
          messageId: item.metadata.messageId,
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
    const result =
      await this.getUnreadNotificationCountUseCase.execute(recipientId);
    return result;
  }

  @Mutation(() => Boolean)
  async markNotificationAsRead(
    @CurrentUser('id') recipientId: string,
    @Args('id', { type: () => String }) notificationId: string,
  ): Promise<boolean> {
    return this.markNotificationAsReadUseCase.execute(
      notificationId,
      recipientId,
    );
  }

  @Mutation(() => Boolean)
  async markAllNotificationsAsRead(
    @CurrentUser('id') recipientId: string,
  ): Promise<boolean> {
    return this.markAllNotificationsAsReadUseCase.execute(recipientId);
  }

  @ResolveField(() => String, { nullable: true })
  async senderName(
    @Parent() notification: NotificationPayload,
  ): Promise<string | null> {
    if (notification.senderName) return notification.senderName;
    if (!notification.senderId) return null;
    try {
      const user = await this.getMeUseCase.execute(notification.senderId);
      return user?.name ?? null;
    } catch {
      return null;
    }
  }

  @ResolveField(() => String, { nullable: true })
  async senderAvatar(
    @Parent() notification: NotificationPayload,
  ): Promise<string | null> {
    if (notification.senderAvatar) return notification.senderAvatar;
    if (!notification.senderId) return null;
    try {
      const user = await this.getMeUseCase.execute(notification.senderId);
      return user?.avatar ?? null;
    } catch {
      return null;
    }
  }
}
