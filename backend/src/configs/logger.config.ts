import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { startTime } from 'pino-http';
import { extractClientIp } from 'src/common/utils/client-ip.util';
import { getGraphQLInfo } from 'src/common/utils/graphql-logger.util';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

const SILENT_MUTATIONS = new Set<string>([
  'UpdateMemberLastReadMessage',
]);

const REDACTED_LOG_FIELDS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.confirmPassword',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.refreshToken',
  'res.headers["set-cookie"]',
];

const extractUserId = (req: unknown): string | undefined => {
  const reqWithUser = req as { user?: { id?: string; _id?: string } };
  return reqWithUser?.user?.id || reqWithUser?.user?._id;
};

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              ignore: 'pid,hostname,req,res',
            },
          }
        : undefined,
    autoLogging: {
      ignore: (req) => {
        const url = req.url || '';
        return (
          url.startsWith('/health') ||
          url.startsWith('/metrics') ||
          url === '/favicon.ico'
        );
      },
    },
    genReqId: (req, res) => {
      const headerId = req.headers['x-request-id'];
      const existingId = Array.isArray(headerId) ? headerId[0] : headerId;
      const id =
        typeof existingId === 'string' && existingId
          ? existingId
          : (req.id as string) || randomUUID();
      if (!res.headersSent) {
        res.setHeader('x-request-id', id);
      }
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
      if (res.statusCode >= 400) return 'warn';

      const resWithStart = res as unknown as { [startTime]?: number };
      const start = resWithStart[startTime];
      const responseTime = start ? Date.now() - start : 0;
      if (responseTime >= SLOW_REQUEST_THRESHOLD_MS) {
        return 'warn';
      }

      const { operationName, isMutation, isQuery } = getGraphQLInfo(req);

      if (operationName === 'IntrospectionQuery') {
        return 'silent';
      }

      if (operationName && SILENT_MUTATIONS.has(operationName)) {
        return process.env.LOG_LEVEL === 'debug' ? 'debug' : 'silent';
      }

      if (isMutation) {
        return 'info';
      }

      if (isQuery || req.method === 'GET') {
        return process.env.LOG_LEVEL === 'debug' ? 'debug' : 'silent';
      }

      return 'info';
    },
    redact: REDACTED_LOG_FIELDS,
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
    customSuccessMessage: (req, res, responseTime) => {
      const { operationName } = getGraphQLInfo(req);
      const isSlow = responseTime >= SLOW_REQUEST_THRESHOLD_MS;
      const slowTag = isSlow ? ' [SLOW QUERY]' : '';
      const userId = extractUserId(req);
      const userTag = userId ? ` (user: ${userId})` : '';
      const target = operationName
        ? `[GraphQL: ${operationName}]`
        : `[${req.method}] ${req.url}`;

      return `${target}${userTag} -> ${res.statusCode} (${responseTime}ms)${slowTag}`;
    },
    customErrorMessage: (req, res, err) => {
      const { operationName } = getGraphQLInfo(req);
      const userId = extractUserId(req);
      const userTag = userId ? ` (user: ${userId})` : '';
      const target = operationName
        ? `[GraphQL: ${operationName}]`
        : `[${req.method}] ${req.url}`;
      return `${target}${userTag} -> ${res.statusCode} (${err.message})`;
    },
  },
};
