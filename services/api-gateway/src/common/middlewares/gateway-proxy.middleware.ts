import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { GatewayProxyService } from '../../proxy/gateway-proxy.service';

@Injectable()
export class GatewayProxyMiddleware implements NestMiddleware {
  constructor(private readonly gatewayProxyService: GatewayProxyService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    this.gatewayProxyService.handleHttpRequest(req, res, next);
  }
}
