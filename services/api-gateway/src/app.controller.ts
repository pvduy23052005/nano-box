import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { GatewayServiceName } from './common/constants/gateway.enum';
import {
  DependencyHealth,
  RateLimitService,
} from './common/services/rate-limit.service';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: GatewayServiceName;
  timestamp: string;
}

export interface ReadinessCheckResponse extends HealthCheckResponse {
  checks: {
    redis: DependencyHealth;
  };
}

@Controller('health')
export class AppController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('live')
  getLiveness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: GatewayServiceName.API_GATEWAY,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness(): Promise<ReadinessCheckResponse> {
    const redis = await this.rateLimitService.checkHealth();
    const isHealthy = redis.status === 'up';
    const payload: ReadinessCheckResponse = {
      status: isHealthy ? 'ok' : 'error',
      service: GatewayServiceName.API_GATEWAY,
      timestamp: new Date().toISOString(),
      checks: { redis },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }
}
