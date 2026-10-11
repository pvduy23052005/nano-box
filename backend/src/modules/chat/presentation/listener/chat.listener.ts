import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import {
  ROOM_EVENTS,
  type RoomMemberAddedPayload,
  type RoomMemberRemovedPayload,
  type RoomAdminAssignedPayload,
  type RoomAdminRevokedPayload,
  type RoomMemberLeftPayload,
} from 'src/modules/room/presentation/event/room.event';
import type { RoomProps } from 'src/modules/room/domain/room.type';
import { CHAT_SOCKET_EVENTS } from '../gateway/event.type';
import { SendSystemMessageUseCase } from '../../application/use-cases/send-system-message.use-case';

@Injectable()
export class ChatListener {
  private readonly logger = new Logger(ChatListener.name);

  constructor(
    private readonly sendSystemMessageUseCase: SendSystemMessageUseCase,
    private readonly websocketService: WebsocketService,
  ) {}

  private async sendRoomSystemMessage(params: {
    room: RoomProps;
    actorId: string;
    targetUserName?: string;
    extraRecipientId?: string;
    buildContent: (actorName: string, targetName: string) => string;
    eventName: string;
  }): Promise<void> {
    try {
      const { room, actorId, targetUserName, extraRecipientId, buildContent } =
        params;
      if (!room || !actorId) return;

      const actor = (room.members || []).find(
        (member) => member.userId === actorId,
      );
      const displayActor = actor?.name || 'Quản trị viên';
      const displayTarget = targetUserName || 'thành viên';
      const content = buildContent(displayActor, displayTarget);

      const { message, memberIds: roomMemberIds } =
        await this.sendSystemMessageUseCase.execute({
          roomId: room.id,
          content,
          senderName: 'Hệ thống',
        });

      const recipientIds = Array.from(
        new Set(
          [
            ...(room.members || []).map((member) => member.userId),
            ...(roomMemberIds || []),
            ...(extraRecipientId ? [extraRecipientId] : []),
          ].filter(Boolean),
        ),
      );

      this.websocketService.server
        ?.to(recipientIds)
        ?.emit(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    } catch (error) {
      this.logger.error(
        `Error handling ${params.eventName} in ChatListener`,
        error,
      );
    }
  }

  @OnEvent(ROOM_EVENTS.MEMBER_ADDED)
  async handleRoomMemberAdded(payload: RoomMemberAddedPayload): Promise<void> {
    const added = (payload.room.members || []).find(
      (member) => member.userId === payload.addedUserId,
    );
    await this.sendRoomSystemMessage({
      room: payload.room,
      actorId: payload.adderId,
      targetUserName: added?.name ?? undefined,
      buildContent: (actor, target) => `${actor} đã thêm ${target} vào nhóm`,
      eventName: ROOM_EVENTS.MEMBER_ADDED,
    });
  }

  @OnEvent(ROOM_EVENTS.MEMBER_REMOVED)
  async handleRoomMemberRemoved(
    payload: RoomMemberRemovedPayload,
  ): Promise<void> {
    await this.sendRoomSystemMessage({
      room: payload.room,
      actorId: payload.actorId,
      targetUserName: payload.removedMember?.name ?? undefined,
      extraRecipientId: payload.removedUserId,
      buildContent: (actor, target) => `${actor} đã xóa ${target} khỏi nhóm`,
      eventName: ROOM_EVENTS.MEMBER_REMOVED,
    });
  }

  @OnEvent(ROOM_EVENTS.ADMIN_ASSIGNED)
  async handleRoomAdminAssigned(
    payload: RoomAdminAssignedPayload,
  ): Promise<void> {
    const target = (payload.room.members || []).find(
      (member) => member.userId === payload.targetUserId,
    );
    await this.sendRoomSystemMessage({
      room: payload.room,
      actorId: payload.actorId,
      targetUserName: target?.name ?? undefined,
      buildContent: (actor, target) =>
        `${actor} đã bổ nhiệm ${target} làm quản trị viên`,
      eventName: ROOM_EVENTS.ADMIN_ASSIGNED,
    });
  }

  @OnEvent(ROOM_EVENTS.ADMIN_REVOKED)
  async handleRoomAdminRevoked(
    payload: RoomAdminRevokedPayload,
  ): Promise<void> {
    const target = (payload.room.members || []).find(
      (member) => member.userId === payload.targetUserId,
    );
    await this.sendRoomSystemMessage({
      room: payload.room,
      actorId: payload.actorId,
      targetUserName: target?.name ?? undefined,
      buildContent: (actor, target) =>
        `${actor} đã thu hồi quyền quản trị viên của ${target}`,
      eventName: ROOM_EVENTS.ADMIN_REVOKED,
    });
  }

  @OnEvent(ROOM_EVENTS.MEMBER_LEFT)
  async handleRoomMemberLeft(payload: RoomMemberLeftPayload): Promise<void> {
    if (payload.isRoomEmpty || !payload.room) return;
    await this.sendRoomSystemMessage({
      room: payload.room,
      actorId: payload.actorId,
      extraRecipientId: payload.actorId,
      buildContent: (actor) => `${actor} đã rời khỏi nhóm`,
      eventName: ROOM_EVENTS.MEMBER_LEFT,
    });
  }
}
