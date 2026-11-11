import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_SOCKET_EVENTS,
  type MessageReactionEventPayload,
  type FriendRequestEventPayload,
  type RoomCreatedEventPayload,
  type MessageMentionEventPayload,
} from './notification.event';
import {
  ROOM_EVENTS,
  ROOM_MEMBER_ACTIONS,
  type RoomMemberAction,
  type RoomMemberAddedPayload,
  type RoomMemberRemovedPayload,
  type RoomAdminAssignedPayload,
  type RoomAdminRevokedPayload,
} from 'src/modules/room/presentation/event/room.event';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '../../domain/notification.type';
import type { RoomProps } from 'src/modules/room/domain/room.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';

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

  @OnEvent(NOTIFICATION_EVENTS.MESSAGE_MENTION)
  async handleMessageMention(
    payload: MessageMentionEventPayload,
  ): Promise<void> {
    try {
      const { message, mentionedUserIds, senderId, senderName, senderAvatar } =
        payload;

      if (!message || !mentionedUserIds?.length || !senderId) return;

      let displaySenderName = senderName;
      let displaySenderAvatar = senderAvatar;

      if (!displaySenderName) {
        const sender = await this.userRepository.findById(senderId);
        if (sender) {
          displaySenderName = sender.getName();
          displaySenderAvatar = sender.getAvatar();
        }
      }

      const title = displaySenderName || 'Tin nhắn mới';
      const content = `${displaySenderName || 'Ai đó'} đã nhắc đến bạn trong một tin nhắn.`;

      const recipients = mentionedUserIds.filter((id) => id && id !== senderId);

      const results = await Promise.allSettled(
        recipients.map(async (recipientId) => {
          const notification = await this.createNotificationUseCase.execute({
            recipientId,
            senderId,
            senderName: displaySenderName ?? undefined,
            senderAvatar: displaySenderAvatar ?? undefined,
            type: NotificationType.MENTION,
            title,
            content,
            metadata: {
              roomId: message.roomId,
              messageId: message.id,
            },
          });

          this.websocketService.server
            ?.to(recipientId)
            ?.emit(
              NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
              notification,
            );
        }),
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(
            `Error creating mention notification for ${recipients[index]}`,
            result.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error('Error handling message.mention event', error);
    }
  }

  @OnEvent(NOTIFICATION_EVENTS.FRIEND_REQUEST)
  async handleFriendRequest(payload: FriendRequestEventPayload): Promise<void> {
    try {
      const {
        requesterId,
        addresseeId,
        friendshipId,
        requesterName,
        requesterAvatar,
      } = payload;

      const title = 'Lời mời kết bạn mới';
      const content = `${requesterName} đã gửi cho bạn một lời mời kết bạn.`;

      const notification = await this.createNotificationUseCase.execute({
        recipientId: addresseeId,
        senderId: requesterId,
        senderName: requesterName,
        senderAvatar: requesterAvatar ?? '',
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

  @OnEvent(NOTIFICATION_EVENTS.ROOM_CREATED)
  async handleRoomCreated(payload: RoomCreatedEventPayload): Promise<void> {
    try {
      const {
        roomId,
        roomTitle,
        creatorId,
        creatorName,
        creatorAvatar,
        memberIds,
      } = payload;

      if (!roomId || !creatorId || !memberIds?.length) return;

      let senderName = creatorName;
      let senderAvatar = creatorAvatar;

      if (!senderName) {
        const creator = await this.userRepository.findById(creatorId);
        if (creator) {
          senderName = creator.getName();
          senderAvatar = creator.getAvatar();
        }
      }

      const displaySenderName = senderName;
      const title = roomTitle;
      const content = `${displaySenderName} đã thêm bạn vào nhóm "${title}".`;

      const recipients = memberIds.filter((id) => id && id !== creatorId);

      const results = await Promise.allSettled(
        recipients.map(async (recipientId) => {
          const notification = await this.createNotificationUseCase.execute({
            recipientId,
            senderId: creatorId,
            senderName: displaySenderName,
            senderAvatar,
            type: NotificationType.NEW_ROOM,
            title,
            content,
            metadata: {
              roomId,
            },
          });

          this.websocketService.server
            ?.to(recipientId)
            ?.emit(
              NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
              notification,
            );
        }),
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(
            `Error creating room.created notification for ${recipients[index]}`,
            result.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error('Error handling room.created event', error);
    }
  }

  private async sendRoomMemberNotification(params: {
    room: RoomProps;
    actorId: string;
    targetUserId: string;
    action: RoomMemberAction;
    buildContent: (actorName: string, roomTitle: string) => string;
    eventName: string;
  }): Promise<void> {
    try {
      const { room, actorId, targetUserId, action, buildContent } = params;
      if (!room || !actorId || !targetUserId) return;

      const actor = (room.members || []).find(
        (member) => member.userId === actorId,
      );
      const displaySenderName = actor?.name || 'Quản trị viên';
      const title = room.title || 'Nhóm';
      const content = buildContent(displaySenderName, title);

      const notification = await this.createNotificationUseCase.execute({
        recipientId: targetUserId,
        senderId: actorId,
        senderName: displaySenderName,
        senderAvatar: actor?.avatar ?? undefined,
        type: NotificationType.ROOM_ACTION,
        title,
        content,
        metadata: {
          roomId: room.id,
          action,
        },
      });

      this.websocketService.server
        ?.to(targetUserId)
        ?.emit(NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION, notification);
    } catch (error) {
      this.logger.error(`Error handling ${params.eventName} event`, error);
    }
  }

  @OnEvent(ROOM_EVENTS.MEMBER_ADDED)
  async handleRoomMemberAdded(payload: RoomMemberAddedPayload): Promise<void> {
    await this.sendRoomMemberNotification({
      room: payload.room,
      actorId: payload.adderId,
      targetUserId: payload.addedUserId,
      action: ROOM_MEMBER_ACTIONS.MEMBER_ADDED,
      buildContent: (actor, title) =>
        `${actor} đã thêm bạn vào nhóm "${title}".`,
      eventName: ROOM_EVENTS.MEMBER_ADDED,
    });
  }

  @OnEvent(ROOM_EVENTS.MEMBER_REMOVED)
  async handleRoomMemberRemoved(
    payload: RoomMemberRemovedPayload,
  ): Promise<void> {
    await this.sendRoomMemberNotification({
      room: payload.room,
      actorId: payload.actorId,
      targetUserId: payload.removedUserId,
      action: ROOM_MEMBER_ACTIONS.MEMBER_REMOVED,
      buildContent: (actor, title) =>
        `${actor} đã xóa bạn khỏi nhóm "${title}".`,
      eventName: ROOM_EVENTS.MEMBER_REMOVED,
    });
  }

  @OnEvent(ROOM_EVENTS.ADMIN_ASSIGNED)
  async handleRoomAdminAssigned(
    payload: RoomAdminAssignedPayload,
  ): Promise<void> {
    await this.sendRoomMemberNotification({
      room: payload.room,
      actorId: payload.actorId,
      targetUserId: payload.targetUserId,
      action: ROOM_MEMBER_ACTIONS.ADMIN_ASSIGNED,
      buildContent: (actor, title) =>
        `${actor} đã bổ nhiệm bạn làm quản trị viên của nhóm "${title}".`,
      eventName: ROOM_EVENTS.ADMIN_ASSIGNED,
    });
  }

  @OnEvent(ROOM_EVENTS.ADMIN_REVOKED)
  async handleRoomAdminRevoked(
    payload: RoomAdminRevokedPayload,
  ): Promise<void> {
    await this.sendRoomMemberNotification({
      room: payload.room,
      actorId: payload.actorId,
      targetUserId: payload.targetUserId,
      action: ROOM_MEMBER_ACTIONS.ADMIN_REVOKED,
      buildContent: (actor, title) =>
        `${actor} đã thu hồi quyền quản trị viên của bạn trong nhóm "${title}".`,
      eventName: ROOM_EVENTS.ADMIN_REVOKED,
    });
  }
}
