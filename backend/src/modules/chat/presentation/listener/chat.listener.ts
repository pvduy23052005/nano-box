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
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class ChatListener {
  private readonly logger = new Logger(ChatListener.name);

  constructor(
    private readonly sendSystemMessageUseCase: SendSystemMessageUseCase,
    private readonly websocketService: WebsocketService,
    private readonly chatGateway: ChatGateway,
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

      const roomMemberIds = (room.members || [])
        .map((member) => member.userId)
        .filter(Boolean);

      const { message, memberIds: returnedMemberIds } =
        await this.sendSystemMessageUseCase.execute({
          roomId: room.id,
          content,
          senderName: 'Hệ thống',
          memberIds: roomMemberIds,
        });

      const recipientIds = Array.from(
        new Set(
          [
            ...roomMemberIds,
            ...(returnedMemberIds || []),
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
    const roomId = payload.room?.id;
    const addedUserId = payload.addedUserId;
    if (roomId && addedUserId) {
      this.chatGateway.clearMembershipCache(roomId, addedUserId);
    }

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
    const roomId = payload.room?.id;
    const removedUserId = payload.removedUserId;

    if (roomId && removedUserId) {
      this.chatGateway.clearMembershipCache(roomId, removedUserId);
      this.websocketService.server?.in(removedUserId)?.socketsLeave(roomId);
    }

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
    const roomId = payload.roomId;
    const actorId = payload.actorId;

    if (roomId && actorId) {
      this.chatGateway.clearMembershipCache(roomId, actorId);
      this.websocketService.server?.in(actorId)?.socketsLeave(roomId);
    }

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
