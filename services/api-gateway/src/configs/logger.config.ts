import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import { GatewayHeader } from '../common/constants/gateway.enum';
import { resolveClientIp } from '../common/utils/client-ip.util';
import { resolveCorrelationId } from '../common/utils/correlation-id.util';

const IGNORE_URL = /^\/(health(\/|\?|$)|favicon\.ico$)/;
const REDACT_FIELDS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

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
          const id = resolveCorrelationId(
            req.headers[GatewayHeader.CORRELATION_ID] ??
              req.headers['x-request-id'],
          );
          req.headers[GatewayHeader.CORRELATION_ID] = id;
          if (!res.headersSent) res.setHeader(GatewayHeader.CORRELATION_ID, id);
          return id;
        },
        customProps: (req) => ({ reqId: req.id, ip: resolveClientIp(req) }),
        customLogLevel: (_req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return level === 'debug' ? 'debug' : 'silent';
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
          `[${req.method}] ${req.url} -> ${res.statusCode} (${ms}ms)`,
        customErrorMessage: (req, res, err) =>
          `[${req.method}] ${req.url} -> ${res.statusCode} (${err.message})`,
      },
    };
  }
}
