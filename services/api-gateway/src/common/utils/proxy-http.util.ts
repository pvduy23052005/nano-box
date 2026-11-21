import type * as http from 'node:http';
import type * as net from 'node:net';
import {
  GatewayHeader,
  GatewayRoutePrefix,
  GatewayServiceName,
} from '../constants/gateway.enum';
import { isFromTrustedProxy, resolveClientIp } from './client-ip.util';
import { resolveCorrelationId } from './correlation-id.util';

export const UPSTREAM_CORS_HEADERS = [
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-expose-headers',
  'access-control-max-age',
] as const;

const UNTRUSTED_FORWARDING_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
  'forwarded',
  'true-client-ip',
  'cf-connecting-ip',
] as const;

export function matchPathPrefix(
  rawUrl: string,
  prefix: GatewayRoutePrefix,
): boolean {
  try {
    const { pathname } = new URL(rawUrl, 'http://localhost');
    return pathname === String(prefix) || pathname.startsWith(`${prefix}/`);
  } catch {
    return false;
  }
}

export function sanitizeForwardingHeaders(req: http.IncomingMessage): string {
  const clientIp = resolveClientIp(req);
  const proto = resolveForwardedProto(req);
  const host = req.headers.host?.trim();

  for (const header of UNTRUSTED_FORWARDING_HEADERS) {
    delete req.headers[header];
  }

  req.headers['x-forwarded-for'] = clientIp;
  req.headers['x-real-ip'] = clientIp;
  req.headers['x-forwarded-proto'] = proto;
  req.headers[GatewayHeader.CORRELATION_ID] = resolveCorrelationId(
    req.headers[GatewayHeader.CORRELATION_ID],
  );
  if (host) {
    req.headers['x-forwarded-host'] = host;
  }

  return clientIp;
}

function resolveForwardedProto(req: http.IncomingMessage): 'http' | 'https' {
  if (isFromTrustedProxy(req)) {
    const raw = req.headers['x-forwarded-proto'];
    const list = Array.isArray(raw) ? raw.join(',') : raw;
    const rightmost = list?.split(',').pop()?.trim().toLowerCase();
    if (rightmost === 'http' || rightmost === 'https') {
      return rightmost;
    }
  }

  return (req.socket as { encrypted?: boolean }).encrypted ? 'https' : 'http';
}

export function rejectSocketUpgrade(
  socket: net.Socket,
  statusCode: number,
  statusText: string,
  headers: Record<string, string>,
): void {
  if (socket.destroyed) {
    return;
  }

  const body = JSON.stringify({ statusCode, error: statusText });
  const lines = [
    `HTTP/1.1 ${statusCode} ${statusText}`,
    'Content-Type: application/json; charset=utf-8',
    `Content-Length: ${Buffer.byteLength(body)}`,
    'Connection: close',
    ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
  ];

  socket.end(`${lines.join('\r\n')}\r\n\r\n${body}`);
}

export function writeProxyBadGateway(
  serviceName: GatewayServiceName,
  res: http.ServerResponse | net.Socket,
): void {
  if (!('writeHead' in res)) {
    res.destroy();
    return;
  }

  if (res.headersSent) {
    res.end();
    return;
  }

  res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(
    JSON.stringify({
      statusCode: 502,
      error: 'Bad Gateway',
      message: `Không thể kết nối tới dịch vụ ${serviceName}`,
    }),
  );
}
