import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ILogger } from 'src/common/ports/logger.port';

@Injectable()
export class PinoLoggerAdapter implements ILogger {
  constructor(private readonly pinoLogger: PinoLogger) {}

  info(context: Record<string, unknown>, message: string): void {
    this.pinoLogger.info(context, message);
  }

  warn(context: Record<string, unknown>, message: string): void {
    this.pinoLogger.warn(context, message);
  }

  error(
    context: Record<string, unknown>,
    message: string,
    trace?: string,
  ): void {
    this.pinoLogger.error({ ...context, trace }, message);
  }
}
