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
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext<{ req: AuthenticatedRequest }>();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Thiếu token hoặc định dạng token không hợp lệ',
      );
    }

    const accessToken = authHeader.substring(7).trim();
    if (!accessToken) {
      throw new UnauthorizedException(
        'Phiên làm việc đã kết thúc hoặc không có quyền',
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
