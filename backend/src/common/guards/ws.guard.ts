import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { parseCookie } from 'cookie';
import { TokenPayload } from 'src/modules/auth/applications/dto/login.type';
import { AuthenticatedSocket } from 'src/infrastructure/websocket/ws.type';

export type SocketAuth = AuthenticatedSocket;

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();

      if (client.data?.user) {
        return true;
      }

      const token = this.extractToken(client);
      if (!token) {
        throw new WsException('Thiếu token xác thực');
      }

      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);

      client.data.user = payload;
      client.data.userId = payload.id;

      return true;
    } catch {
      throw new WsException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  private extractToken(client: AuthenticatedSocket): string | null {
    const auth = client.handshake?.auth as
      | { token?: string; accessToken?: string }
      | undefined;
    if (auth?.token && typeof auth.token === 'string') {
      return auth.token.startsWith('Bearer ')
        ? auth.token.substring(7).trim()
        : auth.token.trim();
    }
    if (auth?.accessToken && typeof auth.accessToken === 'string') {
      return auth.accessToken.startsWith('Bearer ')
        ? auth.accessToken.substring(7).trim()
        : auth.accessToken.trim();
    }

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

    const query = client.handshake?.query;
    const queryToken = query?.token || query?.accessToken;
    if (typeof queryToken === 'string') {
      return queryToken.startsWith('Bearer ')
        ? queryToken.substring(7).trim()
        : queryToken.trim();
    }

    return null;
  }
}
