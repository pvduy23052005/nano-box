import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import { startTime } from 'pino-http';

const SLOW_MS = 1000;
const VALID_ID = /^[a-zA-Z0-9._-]{1,64}$/;
const IGNORE_URL = /^\/(health(\/|\?|$)|favicon\.ico$)/;
const REDACT_FIELDS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

const pickValidId = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const raw: unknown = Array.isArray(value) ? value[0] : value;
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (VALID_ID.test(trimmed)) return trimmed;
  }
  return undefined;
};

const getElapsedMs = (res: object): number => {
  const start = (res as { [startTime]?: number })[startTime];
  return start ? Date.now() - start : 0;
};

const extractClientIp = (req: IncomingMessage): string => {
  const ip = (req as { ip?: string }).ip || req.socket?.remoteAddress;
  return ip ? ip.replace(/^::ffff:/, '') : 'unknown';
};

@Injectable()
export class LoggerConfigService {
  constructor(private readonly configService: ConfigService) {}

  createOptions(): Params {
    const level = this.configService.get<string>('LOG_LEVEL', 'info');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    return {
      pinoHttp: {
        level,
        formatters: { level: (label) => ({ level: label }) },
        transport: isProd
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
                ignore: 'pid,hostname,req,res',
              },
            },
        autoLogging: { ignore: (req) => IGNORE_URL.test(req.url || '') },
        genReqId: (req, res) => {
          const id =
            pickValidId(
              req.headers['x-correlation-id'],
              req.headers['x-request-id'],
              req.id,
            ) ?? randomUUID();
          if (!res.headersSent) res.setHeader('x-correlation-id', id);
          return id;
        },
        customProps: (req) => ({
          reqId: req.id,
          ip: extractClientIp(req),
        }),
        customLogLevel: (_req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400 || getElapsedMs(res) >= SLOW_MS) {
            return 'warn';
          }
          return 'info';
        },
        redact: REDACT_FIELDS,
        serializers: {
          req: (req: Record<string, unknown>) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res: Record<string, unknown>) => ({
            statusCode: res.statusCode,
          }),
        },
        customSuccessMessage: (req, res, ms) =>
          `[${req.method}] ${req.url} -> ${res.statusCode} (${ms}ms)` +
          `${ms >= SLOW_MS ? ' [SLOW REQUEST]' : ''}`,
        customErrorMessage: (req, res, err) =>
          `[${req.method}] ${req.url} -> ${res.statusCode} (${err.message})`,
      },
    };
  }
}
