import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as eventType from './event.type';
import type { AuthenticatedSocket } from 'src/infrastructure/websocket/ws.type';
import { RoomRepositoryAdapter } from 'src/modules/room/application/ports/room.ports';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly membershipCache = new Map<
    string,
    { isMember: boolean; expiresAt: number }
  >();
  private readonly CACHE_TTL_MS = 2 * 60 * 1000;

  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  public clearMembershipCache(roomId?: string, userId?: string): void {
    if (roomId && userId) {
      this.membershipCache.delete(`${roomId}:${userId}`);
    } else if (roomId) {
      for (const key of this.membershipCache.keys()) {
        if (key.startsWith(`${roomId}:`)) {
          this.membershipCache.delete(key);
        }
      }
    } else {
      this.membershipCache.clear();
    }
  }

  private async verifyMembership(
    roomId: string,
    userId: string,
  ): Promise<boolean> {
    const cacheKey = `${roomId}:${userId}`;
    const cached = this.membershipCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.isMember;
    }

    let isMember = false;
    if (typeof this.roomRepository.isUserMember === 'function') {
      isMember = await this.roomRepository.isUserMember(roomId, userId);
    } else {
      const room = await this.roomRepository.findById(roomId);
      isMember = !!room?.members?.some((member) => member.userId === userId);
    }

    if (this.membershipCache.size > 2000) {
      for (const [key, item] of this.membershipCache.entries()) {
        if (now > item.expiresAt) {
          this.membershipCache.delete(key);
        }
      }
    }

    this.membershipCache.set(cacheKey, {
      isMember,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return isMember;
  }

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.RoomActionPayload,
  ) {
    const userId = client.data.userId;
    if (!payload?.roomId || !userId) return;

    if (client.rooms.has(payload.roomId)) return;

    const isMember = await this.verifyMembership(payload.roomId, userId);
    if (!isMember) return;

    await client.join(payload.roomId);
  }

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.RoomActionPayload,
  ) {
    if (!payload?.roomId) return;
    await client.leave(payload.roomId);
  }

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING)
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.TypingPayload,
  ) {
    const userIdTyping = client.data.userId;
    if (!payload?.roomId || !userIdTyping) return;

    if (!client.rooms.has(payload.roomId)) {
      const isMember = await this.verifyMembership(
        payload.roomId,
        userIdTyping,
      );
      if (!isMember) return;
      await client.join(payload.roomId);
    }

    client
      .to(payload.roomId)
      .emit(eventType.CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, {
        ...payload,
        userId: userIdTyping,
      });
  }
}
