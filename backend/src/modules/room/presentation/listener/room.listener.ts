import {
  ROOM_EVENTS,
  type RoomMemberAddedPayload,
  type RoomMemberRemovedPayload,
  type RoomAdminAssignedPayload,
  type RoomAdminRevokedPayload,
} from '../event/room.event';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { ROOM_SOCKET_EVENTS } from '../gateway/event.type';
import type { RoomOutput } from '../dto/room.output';

@Injectable()
export class RoomListener {
  private readonly logger = new Logger(RoomListener.name);

  constructor(private readonly websocketService: WebsocketService) {}

  private emitRoomSync(
    roomOutput: RoomOutput,
    recipientIds: string[],
    eventName: string,
  ): void {
    try {
      const validRecipients = Array.from(new Set(recipientIds.filter(Boolean)));
      if (validRecipients.length === 0) return;

      this.websocketService.server
        ?.to(validRecipients)
        ?.emit(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, roomOutput);
      this.websocketService.server
        ?.to(validRecipients)
        ?.emit(ROOM_SOCKET_EVENTS.ROOM_UPDATED, roomOutput);
    } catch (error) {
      this.logger.error(
        `Error emitting room sync socket for ${eventName}`,
        error,
      );
    }
  }

  @OnEvent(ROOM_EVENTS.MEMBER_ADDED)
  handleRoomMemberAddedSocket(payload: RoomMemberAddedPayload): void {
    const recipientIds = (payload.room?.members || []).map(
      (member) => member.userId,
    );
    this.emitRoomSync(
      payload.roomOutput,
      recipientIds,
      ROOM_EVENTS.MEMBER_ADDED,
    );
  }

  @OnEvent(ROOM_EVENTS.MEMBER_REMOVED)
  handleRoomMemberRemovedSocket(payload: RoomMemberRemovedPayload): void {
    const recipientIds = [
      ...(payload.room?.members || []).map((member) => member.userId),
      payload.removedUserId,
    ];
    this.emitRoomSync(
      payload.roomOutput,
      recipientIds,
      ROOM_EVENTS.MEMBER_REMOVED,
    );
  }

  @OnEvent(ROOM_EVENTS.ADMIN_ASSIGNED)
  handleRoomAdminAssignedSocket(payload: RoomAdminAssignedPayload): void {
    const recipientIds = (payload.room?.members || []).map(
      (member) => member.userId,
    );
    this.emitRoomSync(
      payload.roomOutput,
      recipientIds,
      ROOM_EVENTS.ADMIN_ASSIGNED,
    );
  }

  @OnEvent(ROOM_EVENTS.ADMIN_REVOKED)
  handleRoomAdminRevokedSocket(payload: RoomAdminRevokedPayload): void {
    const recipientIds = (payload.room?.members || []).map(
      (member) => member.userId,
    );
    this.emitRoomSync(
      payload.roomOutput,
      recipientIds,
      ROOM_EVENTS.ADMIN_REVOKED,
    );
  }
}
