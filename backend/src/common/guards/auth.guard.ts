import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenPayload } from 'src/modules/auth/applications/dto/login.type';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req: AuthenticatedRequest;

    if (context.getType<'http' | 'graphql'>() === 'http') {
      req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      req = gqlContext.getContext<{ req: AuthenticatedRequest }>().req;
    }

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
