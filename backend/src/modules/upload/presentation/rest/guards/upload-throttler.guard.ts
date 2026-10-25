import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class UploadThrottlerGuard implements CanActivate {
  private static readonly WINDOW_MS = 60 * 1000;
  private static readonly MAX_REQUESTS = 20;
  private readonly records = new Map<string, RateLimitRecord>();

  constructor() {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.records.entries()) {
        if (now > record.resetTime) {
          this.records.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    if (timer.unref) {
      timer.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: string } }>();
    const now = Date.now();

    const key =
      request.user?.id ||
      request.ip ||
      request.headers['x-forwarded-for']?.toString() ||
      'anonymous';

    const currentRecord = this.records.get(key);

    if (!currentRecord || now > currentRecord.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + UploadThrottlerGuard.WINDOW_MS,
      });
      return true;
    }

    if (currentRecord.count >= UploadThrottlerGuard.MAX_REQUESTS) {
      throw new HttpException(
        'Bạn đã tải lên quá nhiều lần. Vui lòng thử lại sau 1 phút',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentRecord.count += 1;
    return true;
  }
}
