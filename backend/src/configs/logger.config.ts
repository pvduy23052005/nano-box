import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

export const loggerConfig: Params = {
  pinoHttp: {
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
    customProps: (req) => ({
      reqId: req.id,
    }),
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
      const opName =
        body?.operationName ||
        (typeof body?.query === 'string'
          ? body.query.match(/(query|mutation)\s+(\w+)/)?.[2]
          : undefined);

      if (opName) {
        return `[GraphQL: ${opName}] -> ${res.statusCode} (${responseTime}ms)`;
      }
      return `[${req.method}] ${req.url} -> ${res.statusCode} (${responseTime}ms)`;
    },
    customErrorMessage: (req, res, err) => {
      return `[${req.method}] ${req.url} -> ${res.statusCode} (${err.message})`;
    },
  },
};
