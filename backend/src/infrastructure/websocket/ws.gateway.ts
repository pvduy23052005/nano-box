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
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { REDIS_KEYS } from 'src/infrastructure/redis/redis.constant';

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

  private static readonly RELATED_USERS_CACHE_TTL_SECONDS = 5 * 60;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
    private readonly presenceService: PresenceService,
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
    private readonly redisService: RedisService,
  ) {}

  async clearUserRelatedCache(userId: string): Promise<void> {
    const cacheKey = REDIS_KEYS.RELATED_USERS(userId);
    await this.redisService.del(cacheKey);
  }

  afterInit(server: Server) {
    this.websocketService.server = server;

    server.use((socket: AuthenticatedSocket, next) => {
      void (async () => {
        try {
          const token = this.extractToken(socket);
          if (!token) {
            return next(new Error('Thiếu token xác thực'));
          }

          const payload =
            await this.jwtService.verifyAsync<TokenPayload>(token);
          socket.data.user = payload;
          socket.data.userId = payload.id;
          next();
        } catch {
          next(new Error('Token không hợp lệ hoặc đã hết hạn'));
        }
      })();
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      void client.join(userId);

      const isJustOnline = await this.presenceService.addConnection(
        userId,
        client.id,
      );

      const relatedUserIds = await this.getRelatedUserIds(userId);
      client.data.relatedUserIds = relatedUserIds;

      const onlineRelatedUserIds =
        await this.presenceService.filterOnlineUsers(relatedUserIds);

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
  async handleLogout(client: AuthenticatedSocket): Promise<void> {
    const userId = client.data.userId;
    if (userId) {
      const relatedUserIds =
        client.data.relatedUserIds ?? (await this.getRelatedUserIds(userId));

      await this.presenceService.removeUserImmediately(userId, () => {
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

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    const userId = client.data.userId;
    if (userId) {
      const relatedUserIds =
        client.data.relatedUserIds ?? (await this.getRelatedUserIds(userId));

      await this.presenceService.removeConnection(userId, client.id, () => {
        if (relatedUserIds && relatedUserIds.length > 0) {
          this.server
            .to(relatedUserIds)
            .emit(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, {
              userId,
            });
        }
      });
    }
  }

  private async getRelatedUserIds(userId: string): Promise<string[]> {
    const cacheKey = REDIS_KEYS.RELATED_USERS(userId);
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as string[];
      } catch {
        await this.redisService.del(cacheKey);
      }
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
      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        WebsocketGateway.RELATED_USERS_CACHE_TTL_SECONDS,
      );

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
