import {
  GatewayHeader,
  GatewayRoutePrefix,
} from '../common/constants/gateway.enum';
import {
  matchPathPrefix,
  rejectSocketUpgrade,
  sanitizeForwardingHeaders,
} from '../common/utils/proxy-http.util';
import type * as http from 'node:http';
import type * as net from 'node:net';
import { Injectable, Logger } from '@nestjs/common';
import { RateLimitService } from '../common/services/rate-limit.service';
import { resolveCorrelationId } from '../common/utils/correlation-id.util';
import { CorsConfigService } from '../configs/cors-config.service';

type UpgradeCallback = (
  req: http.IncomingMessage,
  socket: net.Socket,
  head: Buffer,
) => void;

@Injectable()
export class GatewayWsUpgradeService {
  private readonly logger = new Logger(GatewayWsUpgradeService.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly corsConfigService: CorsConfigService,
  ) {}

  attach(httpServer: http.Server, onUpgrade: UpgradeCallback): void {
    httpServer.on('upgrade', (req, socket: net.Socket, head) => {
      this.handleUpgrade(req, socket, head, onUpgrade).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`[WS Upgrade Error] ${message}`);
        socket.destroy();
      });
    });
  }

  private async handleUpgrade(
    req: http.IncomingMessage,
    socket: net.Socket,
    head: Buffer,
    onUpgrade: UpgradeCallback,
  ): Promise<void> {
    const onSocketError = (): void => {
      socket.destroy();
    };
    socket.on('error', onSocketError);

    const correlationId = resolveCorrelationId(
      req.headers[GatewayHeader.CORRELATION_ID],
    );
    req.headers[GatewayHeader.CORRELATION_ID] = correlationId;
    const baseHeaders = { [GatewayHeader.CORRELATION_ID]: correlationId };

    if (!matchPathPrefix(req.url ?? '', GatewayRoutePrefix.SOCKET_IO)) {
      rejectSocketUpgrade(socket, 404, 'Not Found', baseHeaders);
      return;
    }

    const { origin } = req.headers;
    if (!this.corsConfigService.isOriginAllowed(origin)) {
      this.logger.warn(`[WS CORS Blocked] Origin "${origin ?? ''}"`);
      rejectSocketUpgrade(socket, 403, 'Forbidden', baseHeaders);
      return;
    }

    const clientIp = sanitizeForwardingHeaders(req);
    const decision = await this.rateLimitService.checkRateLimit(clientIp);
    if (socket.destroyed) {
      return;
    }

    if (!decision.allowed) {
      this.logger.warn(`[WS RateLimit Blocked] IP ${clientIp}`);
      rejectSocketUpgrade(socket, 429, 'Too Many Requests', {
        ...baseHeaders,
        'Retry-After': decision.resetSeconds.toString(),
      });
      return;
    }

    socket.off('error', onSocketError);
    onUpgrade(req, socket, head);
  }
}
