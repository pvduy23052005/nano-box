import { Injectable, Logger } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { GatewayEnvKey } from '../common/constants/gateway.enum';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost',
  'http://localhost',
  'https://nano-boxes.id.vn',
];

@Injectable()
export class CorsConfigService {
  private readonly logger = new Logger(CorsConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  getAllowedOrigins(): string[] {
    const rawOrigins = this.configService.get<string>(
      GatewayEnvKey.ALLOWED_ORIGINS,
      '',
    );

    return rawOrigins
      ? rawOrigins
          .split(',')
          .map((origin) => origin.trim().replace(/\/+$/, ''))
          .filter(Boolean)
      : DEFAULT_ALLOWED_ORIGINS;
  }

  isOriginAllowed(origin: string | undefined): boolean {
    if (origin === undefined) {
      return true;
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (!normalizedOrigin) {
      return false;
    }

    return this.getAllowedOrigins().includes(normalizedOrigin);
  }

  createOptions(): CorsOptions {
    return {
      origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void,
      ) => {
        if (this.isOriginAllowed(origin)) {
          return callback(null, true);
        }

        this.logger.warn(
          `[CORS Blocked] Origin "${origin}" không nằm trong ALLOWED_ORIGINS`,
        );
        return callback(null, false);
      },
      credentials: true,
    };
  }
}
