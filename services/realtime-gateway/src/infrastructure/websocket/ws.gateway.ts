import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parseCookie } from 'cookie';
import type { Server, Socket } from 'socket.io';
import {
  createCorsOriginValidator,
  type CorsOriginCallback,
} from '../configs/cors.util';
import { WebsocketService } from './ws.service';
import type { AuthenticatedSocket, SocketTokenPayload } from './ws.type';

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
      const validator = createCorsOriginValidator(process.env.ALLOWED_ORIGINS);
      validator(origin, callback);
    },
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server): void {
    this.websocketService.server = server;

    server.use((socket: AuthenticatedSocket, next) => {
      void this.authenticateSocket(socket, next);
    });
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const userId = client.data.userId;
    if (!userId) {
      client.disconnect(true);
      return;
    }

    try {
      await client.join(userId);
      this.logger.debug(
        `Socket connected: userId=${userId} socketId=${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to join room for userId=${userId} socketId=${client.id}`,
        error,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data.userId ?? 'unknown';
    this.logger.debug(
      `Socket disconnected: userId=${userId} socketId=${client.id}`,
    );
  }

  private async authenticateSocket(
    socket: AuthenticatedSocket,
    next: (err?: Error) => void,
  ): Promise<void> {
    try {
      const token = this.extractToken(socket);
      if (!token) {
        next(new Error('Thiếu token xác thực'));
        return;
      }

      const payload =
        await this.jwtService.verifyAsync<SocketTokenPayload>(token);
      const userId = typeof payload?.id === 'string' ? payload.id.trim() : '';
      if (!userId) {
        next(new Error('Token không hợp lệ hoặc đã hết hạn'));
        return;
      }

      socket.data.user = payload;
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error('Token không hợp lệ hoặc đã hết hạn'));
    }
  }

  private extractToken(client: AuthenticatedSocket | Socket): string | null {
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) {
        return bearerToken;
      }
    }

    const rawCookie = client.handshake?.headers?.cookie;
    if (rawCookie) {
      const parsedCookies = parseCookie(rawCookie);
      const accessToken = parsedCookies['accessToken']?.trim();
      if (accessToken) {
        return accessToken;
      }

      const fallbackToken = parsedCookies['token']?.trim();
      if (fallbackToken) {
        return fallbackToken;
      }
    }

    return null;
  }
}
