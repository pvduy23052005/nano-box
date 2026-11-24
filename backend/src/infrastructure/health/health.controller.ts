import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { RedisService } from '../redis/redis.service';

const HEALTH_PING_TIMEOUT_MS = 2_000;

export interface DependencyHealth {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: 'backend';
  timestamp: string;
}

export interface ReadinessCheckResponse extends HealthCheckResponse {
  checks: {
    mongodb: DependencyHealth;
    redis: DependencyHealth;
  };
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
  ) {}

  @Get('live')
  getLiveness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness(): Promise<ReadinessCheckResponse> {
    const [mongodb, redis] = await Promise.all([
      this.checkMongoHealth(),
      this.checkRedisHealth(),
    ]);

    const isHealthy = mongodb.status === 'up' && redis.status === 'up';
    const payload: ReadinessCheckResponse = {
      status: isHealthy ? 'ok' : 'error',
      service: 'backend',
      timestamp: new Date().toISOString(),
      checks: { mongodb, redis },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }

  private async checkMongoHealth(): Promise<DependencyHealth> {
    const start = Date.now();

    if (
      this.mongoConnection.readyState !== ConnectionStates.connected ||
      !this.mongoConnection.db
    ) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: `MongoDB connection state is ${this.mongoConnection.readyState}`,
      };
    }

    try {
      await this.withTimeout(
        this.mongoConnection.db.admin().ping(),
        'MongoDB ping timed out',
      );
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkRedisHealth(): Promise<DependencyHealth> {
    const start = Date.now();

    try {
      const response = await this.withTimeout(
        this.redisService.ping(),
        'Redis ping timed out',
      );

      if (response !== 'PONG') {
        return {
          status: 'down',
          latencyMs: Date.now() - start,
          error: `Unexpected ping response: ${response}`,
        };
      }

      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMessage: string,
  ): Promise<T> {
    let timer: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(timeoutMessage)),
          HEALTH_PING_TIMEOUT_MS,
        );
      });

      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
