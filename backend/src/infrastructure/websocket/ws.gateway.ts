import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { parseCookie } from 'cookie';
import { WebsocketService } from './ws.service';
import { PresenceService } from './presence.service';
import type { TokenPayload } from 'src/modules/auth/applications/dto/login.type';
import { type AuthenticatedSocket, PRESENCE_SOCKET_EVENTS } from './ws.type';
import { RoomRepositoryAdapter } from 'src/modules/room/application/ports/room.ports';
import { FriendshipRepositoryAdapter } from 'src/modules/friendship/applications/ports/friendship.port';
import { MemberStatus } from 'src/modules/room/domain/chat.enum';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
            .map((o) => o.trim().replace(/\/+$/, ''))
            .filter(Boolean)
        : ['http://localhost:3000', 'https://localhost', 'http://localhost'];

      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly relatedUsersCache = new Map<
    string,
    { ids: string[]; expiresAt: number }
  >();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
    private readonly presenceService: PresenceService,
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  public clearUserRelatedCache(userId: string): void {
    this.relatedUsersCache.delete(userId);
  }

  afterInit(server: Server) {
    this.websocketService.server = server;

    server.use((socket: AuthenticatedSocket, next) => {
      void (async () => {
        try {
          const token = this.extractToken(socket);
          if (!token) {
            return next(new Error('Unauthorized: Thiếu token xác thực'));
          }

          const payload =
            await this.jwtService.verifyAsync<TokenPayload>(token);
          socket.data.user = payload;
          socket.data.userId = payload.id;
          next();
        } catch {
          next(new Error('Unauthorized: Token không hợp lệ hoặc đã hết hạn'));
        }
      })();
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      void client.join(userId);

      const isJustOnline = this.presenceService.addConnection(
        userId,
        client.id,
      );

      const relatedUserIds = await this.getRelatedUserIds(userId);
      client.data.relatedUserIds = relatedUserIds;

      const onlineRelatedUserIds = relatedUserIds.filter((id) =>
        this.presenceService.isUserOnline(id),
      );

      client.emit(
        PRESENCE_SOCKET_EVENTS.INITIAL_ONLINE_USERS,
        onlineRelatedUserIds,
      );

      if (isJustOnline && relatedUserIds.length > 0) {
        this.server
          .to(relatedUserIds)
          .emit(PRESENCE_SOCKET_EVENTS.USER_ONLINE, {
            userId,
          });
      }
    }
  }

  @SubscribeMessage(PRESENCE_SOCKET_EVENTS.USER_LOGOUT)
  handleLogout(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      const relatedUserIds =
        client.data.relatedUserIds ?? this.getCachedRelatedUserIds(userId);

      this.presenceService.removeUserImmediately(userId, () => {
        if (relatedUserIds && relatedUserIds.length > 0) {
          this.server
            .to(relatedUserIds)
            .emit(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, {
              userId,
            });
        }
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      const relatedUserIds =
        client.data.relatedUserIds ?? this.getCachedRelatedUserIds(userId);

      this.presenceService.removeConnection(userId, client.id, () => {
        const targetIds =
          relatedUserIds ?? this.getCachedRelatedUserIds(userId);
        if (targetIds && targetIds.length > 0) {
          this.server.to(targetIds).emit(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, {
            userId,
          });
        }
      });
    }
  }

  private getCachedRelatedUserIds(userId: string): string[] | null {
    const cached = this.relatedUsersCache.get(userId);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.relatedUsersCache.delete(userId);
      return null;
    }
    return cached.ids;
  }

  private pruneExpiredCache(): void {
    if (this.relatedUsersCache.size < 1000) return;
    const now = Date.now();
    for (const [key, item] of this.relatedUsersCache.entries()) {
      if (now > item.expiresAt) {
        this.relatedUsersCache.delete(key);
      }
    }
  }

  private async getRelatedUserIds(userId: string): Promise<string[]> {
    const cached = this.getCachedRelatedUserIds(userId);
    if (cached) {
      return cached;
    }

    try {
      const [friends, roomMemberIds] = await Promise.all([
        this.friendshipRepository.findFriends(userId),
        this.roomRepository.findRelatedUserIdsByRooms(
          userId,
          MemberStatus.ACCEPTED,
        ),
      ]);

      const relatedIds = new Set<string>();

      for (const friend of friends) {
        if (friend.id && friend.id !== userId) {
          relatedIds.add(friend.id);
        }
      }

      for (const memberId of roomMemberIds) {
        relatedIds.add(memberId);
      }

      const result = Array.from(relatedIds);
      this.pruneExpiredCache();
      this.relatedUsersCache.set(userId, {
        ids: result,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });

      return result;
    } catch {
      return [];
    }
  }

  private extractToken(client: AuthenticatedSocket | Socket): string | null {
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    const rawCookie = client.handshake?.headers?.cookie;
    if (rawCookie) {
      const parsedCookies = parseCookie(rawCookie);
      if (parsedCookies['accessToken']) {
        return parsedCookies['accessToken'].trim();
      }
      if (parsedCookies['token']) {
        return parsedCookies['token'].trim();
      }
    }

    return null;
  }
}
