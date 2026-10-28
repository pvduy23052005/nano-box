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
import { MemberStatus } from 'src/modules/room/domain/chat.enum';

interface MembershipCacheItem {
  isMember: boolean;
  name?: string | null;
  avatar?: string | null;
  expiresAt: number;
}

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly membershipCache = new Map<string, MembershipCacheItem>();
  private readonly CACHE_TTL_MS = 2 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 1000;
  private static readonly TYPING_DEBOUNCE_MS = 300;

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
  ): Promise<Omit<MembershipCacheItem, 'expiresAt'>> {
    const cacheKey = `${roomId}:${userId}`;
    const cached = this.membershipCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return {
        isMember: cached.isMember,
        name: cached.name,
        avatar: cached.avatar,
      };
    }

    let isMember = false;
    let name: string | null = null;
    let avatar: string | null = null;

    if (typeof this.roomRepository.findRoomMembersWithProfile === 'function') {
      const room = await this.roomRepository.findRoomMembersWithProfile(roomId);
      const member = room?.members?.find(
        (member) =>
          member.userId === userId && member.status !== MemberStatus.REFUSED,
      );
      if (member) {
        isMember = true;
        name = member.name ?? null;
        avatar = member.avatar ?? null;
      }
    } else {
      const room = await this.roomRepository.findById(roomId);
      const member = room?.members?.find(
        (member) =>
          member.userId === userId && member.status !== MemberStatus.REFUSED,
      );
      isMember = !!member;
    }

    if (this.membershipCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.membershipCache.keys().next().value;
      if (oldestKey) {
        this.membershipCache.delete(oldestKey as string);
      }
    }

    this.membershipCache.set(cacheKey, {
      isMember,
      name,
      avatar,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return { isMember, name, avatar };
  }

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.RoomActionPayload,
  ) {
    const userId = client.data.userId;
    if (!payload?.roomId || !userId) return;

    if (client.rooms.has(payload.roomId)) return;

    const { isMember } = await this.verifyMembership(payload.roomId, userId);
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

    const now = Date.now();
    if (
      client.data.lastTypingAt &&
      now - client.data.lastTypingAt < ChatGateway.TYPING_DEBOUNCE_MS
    ) {
      return;
    }
    client.data.lastTypingAt = now;

    const memberInfo = await this.verifyMembership(
      payload.roomId,
      userIdTyping,
    );
    if (!memberInfo.isMember) return;

    if (!client.rooms.has(payload.roomId)) {
      await client.join(payload.roomId);
    }

    client
      .to(payload.roomId)
      .emit(eventType.CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, {
        roomId: payload.roomId,
        userId: userIdTyping,
        isTyping: Boolean(payload.isTyping),
        name: memberInfo.name ?? undefined,
        avatar: memberInfo.avatar ?? undefined,
      });
  }
}
