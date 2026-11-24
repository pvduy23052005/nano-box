import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { GatewayRoutePrefix } from '../constants/gateway.enum';
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  RateLimitService,
} from '../services/rate-limit.service';
import { resolveClientIp } from '../utils/client-ip.util';
import { matchPathPrefix } from '../utils/proxy-http.util';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (matchPathPrefix(req.path, GatewayRoutePrefix.HEALTH)) {
      next();
      return;
    }

    const clientIp = resolveClientIp(req);
    const decision = await this.rateLimitService.checkRateLimit(clientIp);

    if (res.writableEnded || res.destroyed) {
      return;
    }

    res.setHeader('RateLimit-Limit', decision.limit.toString());
    res.setHeader('RateLimit-Remaining', decision.remaining.toString());
    res.setHeader('RateLimit-Reset', decision.resetSeconds.toString());

    if (!decision.allowed) {
      res.setHeader('Retry-After', decision.resetSeconds.toString());
      this.logger.warn(
        `[RateLimit Blocked] IP ${clientIp} exceeded ` +
          `${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW_MS}ms`,
      );
      res.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      });
      return;
    }

    next();
  }
}
