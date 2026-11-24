import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DependencyHealth, RateLimitGuard } from '../guards/rate-limit.guard';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: 'upload-service';
  timestamp: string;
}

export interface ReadinessCheckResponse extends HealthCheckResponse {
  checks: {
    redis: DependencyHealth;
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly rateLimitGuard: RateLimitGuard) {}

  @Get('live')
  getLiveness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'upload-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness(): Promise<ReadinessCheckResponse> {
    const redis = await this.rateLimitGuard.checkRedisHealth();
    const isHealthy = redis.status === 'up';
    const payload: ReadinessCheckResponse = {
      status: isHealthy ? 'ok' : 'error',
      service: 'upload-service',
      timestamp: new Date().toISOString(),
      checks: { redis },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }
}
