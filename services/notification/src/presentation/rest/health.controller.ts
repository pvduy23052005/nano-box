import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

const HEALTH_PING_TIMEOUT_MS = 2_000;

export interface DependencyHealth {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: 'notification-service';
  timestamp: string;
}

export interface ReadinessCheckResponse extends HealthCheckResponse {
  checks: {
    mongodb: DependencyHealth;
  };
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get('live')
  getLiveness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReadiness(): Promise<ReadinessCheckResponse> {
    const mongodb = await this.checkMongoHealth();
    const isHealthy = mongodb.status === 'up';
    const payload: ReadinessCheckResponse = {
      status: isHealthy ? 'ok' : 'error',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      checks: { mongodb },
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

    let timer: NodeJS.Timeout | undefined;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('MongoDB ping timed out')),
          HEALTH_PING_TIMEOUT_MS,
        );
      });

      await Promise.race([
        this.mongoConnection.db.admin().ping(),
        timeoutPromise,
      ]);

      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
