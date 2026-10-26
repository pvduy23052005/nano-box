import { IncomingMessage } from 'http';
import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { extractClientIp } from 'src/common/utils/client-ip.util';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

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
      (req as unknown as { _startTime?: number })._startTime = Date.now();
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
    customProps: (req) => ({
      reqId: req.id,
      ip: extractClientIp(req),
    }),
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';

      const startTime = (req as unknown as { _startTime?: number })._startTime;
      const responseTime = startTime ? Date.now() - startTime : 0;
      if (responseTime >= SLOW_REQUEST_THRESHOLD_MS) {
        return 'warn';
      }

      const reqWithBody = req as unknown as {
        body?: { operationName?: string; query?: string };
      };
      const body = reqWithBody.body;
      const queryStr = typeof body?.query === 'string' ? body.query : '';
      const cleanedQuery = queryStr.replace(/#[^\n\r]*/g, '').trim();

      const opMatch = cleanedQuery.match(
        /(query|mutation|subscription)\s*(\w*)/i,
      );
      const opName = body?.operationName || opMatch?.[2];

      if (opName === 'IntrospectionQuery') {
        return 'silent';
      }

      const isMutation = /^\s*mutation/i.test(cleanedQuery);
      if (isMutation) {
        return 'info';
      }

      if (opName || req.method === 'GET') {
        return process.env.LOG_LEVEL === 'debug' ? 'debug' : 'silent';
      }

      return 'info';
    },
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.confirmPassword',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
    ],
    serializers: {
      req: (req: Record<string, unknown>) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        ip: extractClientIp(
          req as unknown as IncomingMessage & { ip?: string },
        ),
      }),
      res: (res: Record<string, unknown>) => ({
        statusCode: res.statusCode,
      }),
    },
    customSuccessMessage: (req, res, responseTime) => {
      const reqWithBody = req as unknown as {
        body?: { operationName?: string; query?: string };
      };
      const body = reqWithBody.body;
      const queryStr = typeof body?.query === 'string' ? body.query : '';
      const cleanedQuery = queryStr.replace(/#[^\n\r]*/g, '').trim();
      const opMatch = cleanedQuery.match(
        /(query|mutation|subscription)\s*(\w*)/i,
      );
      const opName = body?.operationName || opMatch?.[2];

      const isSlow = responseTime >= SLOW_REQUEST_THRESHOLD_MS;
      const slowTag = isSlow ? ' [SLOW QUERY]' : '';

      if (opName) {
        return `[GraphQL: ${opName}] -> ${res.statusCode} (${responseTime}ms)${slowTag}`;
      }
      return `[${req.method}] ${req.url} -> ${res.statusCode} (${responseTime}ms)${slowTag}`;
    },
    customErrorMessage: (req, res, err) => {
      return `[${req.method}] ${req.url} -> ${res.statusCode} (${err.message})`;
    },
  },
};

