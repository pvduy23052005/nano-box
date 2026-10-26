import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { extractClientIp } from 'src/common/utils/client-ip.util';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class AuthThrottlerGuard implements CanActivate, OnModuleDestroy {
  private static readonly WINDOW_MS = 60 * 1000;
  private static readonly MAX_REQUESTS = 10;
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.records.entries()) {
        if (now > record.resetTime) {
          this.records.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
  }

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext<{ req: Request }>()?.req;
    const now = Date.now();

    const clientIp = extractClientIp(req) || 'unknown';
    const key = `auth_limit_${clientIp}`;

    const currentRecord = this.records.get(key);

    if (!currentRecord || now > currentRecord.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + AuthThrottlerGuard.WINDOW_MS,
      });
      return true;
    }

    if (currentRecord.count >= AuthThrottlerGuard.MAX_REQUESTS) {
      throw new HttpException(
        'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentRecord.count += 1;
    return true;
  }
}
