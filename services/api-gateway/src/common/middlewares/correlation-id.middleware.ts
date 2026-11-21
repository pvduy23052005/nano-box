import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { GatewayHeader } from '../constants/gateway.enum';
import { resolveCorrelationId } from '../utils/correlation-id.util';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = resolveCorrelationId(
      req.headers[GatewayHeader.CORRELATION_ID],
    );

    req.headers[GatewayHeader.CORRELATION_ID] = correlationId;
    res.setHeader(GatewayHeader.CORRELATION_ID, correlationId);
    next();
  }
}
