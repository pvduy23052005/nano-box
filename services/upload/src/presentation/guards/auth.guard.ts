import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export interface TokenPayload {
  id: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    let accessToken: string | undefined = (
      req.cookies as Record<string, string> | undefined
    )?.accessToken;

    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7).trim();
      }
    }

    if (!accessToken) {
      throw new UnauthorizedException(
        'Thiếu token hoặc phiên làm việc không hợp lệ',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<TokenPayload>(accessToken);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }
}
