import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { parseCookie } from 'cookie';
import { WebsocketService } from './ws.service';
import type { TokenPayload } from 'src/modules/auth/applications/dto/login.type';
import type { AuthenticatedSocket } from './ws.type';

@WebSocketGateway({
  cors: {
    origin: true,
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

  handleConnection(_client: AuthenticatedSocket) {}

  handleDisconnect(_client: AuthenticatedSocket) {}

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
