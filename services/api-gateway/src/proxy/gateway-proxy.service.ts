import type * as http from 'node:http';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import {
  GatewayEnvKey,
  GatewayRoutePrefix,
  GatewayServiceName,
} from '../common/constants/gateway.enum';
import {
  matchPathPrefix,
  sanitizeForwardingHeaders,
  UPSTREAM_CORS_HEADERS,
  writeProxyBadGateway,
} from '../common/utils/proxy-http.util';
import { GatewayWsUpgradeService } from './gateway-ws-upgrade.service';

const UPLOAD_PROXY_TIMEOUT_MS = 120_000;
const GRAPHQL_PROXY_TIMEOUT_MS = 30_000;
const WS_UPGRADE_TIMEOUT_MS = 10_000;

interface ProxyRouteConfig {
  prefix: GatewayRoutePrefix;
  target: string;
  serviceName: GatewayServiceName;
  timeoutMs?: number;
  upgradeTimeoutMs?: number;
}

@Injectable()
export class GatewayProxyService {
  private readonly logger = new Logger(GatewayProxyService.name);
  private readonly routeProxies: Array<{
    prefix: GatewayRoutePrefix;
    handler: RequestHandler;
  }>;
  private readonly socketIoProxy: RequestHandler;

  constructor(
    configService: ConfigService,
    private readonly wsUpgradeService: GatewayWsUpgradeService,
  ) {
    const backendUrl = configService.get<string>(
      GatewayEnvKey.BACKEND_SERVICE_URL,
      'http://localhost:5050',
    );
    const uploadUrl = configService.get<string>(
      GatewayEnvKey.UPLOAD_SERVICE_URL,
      'http://localhost:5051',
    );
    const notificationUrl = configService.get<string>(
      GatewayEnvKey.NOTIFICATION_SERVICE_URL,
      'http://localhost:5052',
    );

    const routes: ProxyRouteConfig[] = [
      {
        prefix: GatewayRoutePrefix.UPLOAD,
        target: uploadUrl,
        serviceName: GatewayServiceName.UPLOAD_SERVICE,
        timeoutMs: UPLOAD_PROXY_TIMEOUT_MS,
      },
      {
        prefix: GatewayRoutePrefix.NOTIFICATIONS_GRAPHQL,
        target: notificationUrl,
        serviceName: GatewayServiceName.NOTIFICATION_GRAPHQL,
        timeoutMs: GRAPHQL_PROXY_TIMEOUT_MS,
      },
      {
        prefix: GatewayRoutePrefix.GRAPHQL,
        target: backendUrl,
        serviceName: GatewayServiceName.BACKEND_GRAPHQL,
        timeoutMs: GRAPHQL_PROXY_TIMEOUT_MS,
      },
      {
        prefix: GatewayRoutePrefix.SOCKET_IO,
        target: backendUrl,
        serviceName: GatewayServiceName.BACKEND_WEBSOCKET,
        upgradeTimeoutMs: WS_UPGRADE_TIMEOUT_MS,
      },
    ];

    this.routeProxies = routes.map((route) => ({
      prefix: route.prefix,
      handler: this.createServiceProxy(route),
    }));

    const socketRoute = this.routeProxies.find(
      (route) => route.prefix === GatewayRoutePrefix.SOCKET_IO,
    );
    if (!socketRoute) {
      throw new Error('Missing Socket.IO proxy route configuration');
    }
    this.socketIoProxy = socketRoute.handler;
  }

  handleHttpRequest(req: Request, res: Response, next: NextFunction): void {
    const fullUrl = req.originalUrl || req.url;
    const route = this.routeProxies.find(({ prefix }) =>
      matchPathPrefix(fullUrl, prefix),
    );

    if (!route) {
      next();
      return;
    }

    sanitizeForwardingHeaders(req);
    req.url = fullUrl;
    void route.handler(req, res, next);
  }

  attachWebSocketUpgrade(httpServer: http.Server): void {
    this.wsUpgradeService.attach(httpServer, (req, socket, head) => {
      this.socketIoProxy.upgrade(req, socket, head);
    });
  }

  private createServiceProxy(config: ProxyRouteConfig): RequestHandler {
    return createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      ws: false,
      xfwd: false,
      proxyTimeout: config.timeoutMs,
      timeout: config.timeoutMs,
      upgradeTimeout: config.upgradeTimeoutMs,
      on: {
        proxyRes: (proxyRes) => {
          for (const header of UPSTREAM_CORS_HEADERS) {
            delete proxyRes.headers[header];
          }
        },
        error: (err, _req, res) => {
          this.logger.error(
            `[Proxy Error -> ${config.serviceName}] ${err.message}`,
          );
          writeProxyBadGateway(config.serviceName, res);
        },
      },
    });
  }
}
