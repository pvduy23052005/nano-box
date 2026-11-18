import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onModuleInit(): Promise<void> {
    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Could not connect to Redis during initialization: ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch {
      this.logger.warn(
        'Failed to quit Redis client gracefully, disconnecting directly',
      );
      this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  async sAdd(setKey: string, ...membersToAdd: string[]): Promise<number> {
    if (membersToAdd.length === 0) return 0;
    return this.client.sadd(setKey, ...membersToAdd);
  }

  async sRem(setKey: string, ...membersToRemove: string[]): Promise<number> {
    if (membersToRemove.length === 0) return 0;
    return this.client.srem(setKey, ...membersToRemove);
  }

  async sCard(setKey: string): Promise<number> {
    return this.client.scard(setKey);
  }

  async smIsMember(
    setKey: string,
    ...membersToCheck: string[]
  ): Promise<number[]> {
    if (membersToCheck.length === 0) return [];
    return this.client.smismember(setKey, ...membersToCheck);
  }
}
