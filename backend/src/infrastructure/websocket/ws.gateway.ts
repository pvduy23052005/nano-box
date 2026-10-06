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

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
    private readonly presenceService: PresenceService,
  ) {}

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

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      void client.join(userId);

      const isJustOnline = this.presenceService.addConnection(
        userId,
        client.id,
      );

      client.emit(
        PRESENCE_SOCKET_EVENTS.INITIAL_ONLINE_USERS,
        this.presenceService.getOnlineUserIds(),
      );

      if (isJustOnline) {
        client.broadcast.emit(PRESENCE_SOCKET_EVENTS.USER_ONLINE, {
          userId,
        });
      }
    }
  }

  @SubscribeMessage(PRESENCE_SOCKET_EVENTS.USER_LOGOUT)
  handleLogout(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      this.presenceService.removeUserImmediately(userId, () => {
        this.server.emit(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, {
          userId,
        });
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    if (userId) {
      this.presenceService.removeConnection(userId, client.id, () => {
        this.server.emit(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, {
          userId,
        });
      });
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
