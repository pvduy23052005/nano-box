import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { TokenPayload } from 'src/modules/auth/applications/dto/login.type';

export type SockeAuth = {
  data: {
    user: TokenPayload;
  };
};

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Thiếu token xác thực');
      }
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);

      const clientAuth = client as SockeAuth;
      clientAuth.data = clientAuth.data || {};
      clientAuth.data.user = payload;

      return true;
    } catch {
      throw new WsException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  private extractToken(client: Socket): string | null {
    const rawCookie = client.handshake?.headers?.cookie;

    if (rawCookie) {
      const parsedCookies = cookie.parseCookie(rawCookie);

      if (parsedCookies['accessToken']) {
        return parsedCookies['accessToken'].trim();
      }
    }
    return null;
  }
}
