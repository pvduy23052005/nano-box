import { randomUUID } from 'crypto';
import type { IncomingMessage } from 'http';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import { startTime } from 'pino-http';
import { extractClientIp } from 'src/common/utils/client-ip.util';
import { getGraphQLInfo } from 'src/common/utils/graphql-logger.util';

const SLOW_MS = 1000;
const VALID_ID = /^[a-zA-Z0-9._-]{1,64}$/;
const IGNORE_URL = /^\/(health|metrics|favicon\.ico$)/;
const SILENT_MUTATIONS = new Set(['UpdateMemberLastReadMessage']);
const REDACT_FIELDS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.confirmPassword',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.refreshToken',
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

const extractUserId = (req: unknown): string | undefined => {
  const user = (req as { user?: { id?: string; _id?: string } })?.user;
  return user?.id || user?._id;
};

const formatTarget = (req: IncomingMessage): string => {
  const { operationName } = getGraphQLInfo(req);
  const userId = extractUserId(req);
  const target = operationName
    ? `[GraphQL: ${operationName}]`
    : `[${req.method}] ${req.url}`;
  return userId ? `${target} (user: ${userId})` : target;
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
        customProps: (req) => {
          const userId = extractUserId(req);
          return {
            reqId: req.id,
            ip: extractClientIp(req),
            ...(userId ? { userId } : {}),
          };
        },
        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400 || getElapsedMs(res) >= SLOW_MS) {
            return 'warn';
          }

          const { operationName, isMutation, isQuery } = getGraphQLInfo(req);
          if (operationName === 'IntrospectionQuery') return 'silent';
          if (operationName && SILENT_MUTATIONS.has(operationName)) {
            return level === 'debug' ? 'debug' : 'silent';
          }
          if (isMutation) return 'info';
          if (isQuery || req.method === 'GET') {
            return level === 'debug' ? 'debug' : 'silent';
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
          `${formatTarget(req)} -> ${res.statusCode} (${ms}ms)` +
          `${ms >= SLOW_MS ? ' [SLOW QUERY]' : ''}`,
        customErrorMessage: (req, res, err) =>
          `${formatTarget(req)} -> ${res.statusCode} (${err.message})`,
      },
    };
  }
}
