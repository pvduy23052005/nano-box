import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { GatewayEnvKey } from '../constants/gateway.enum';

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 120;
const DEFAULT_REDIS_PORT = 6379;
const REDIS_CONNECT_TIMEOUT_MS = 3_000;
const REDIS_KEY_PREFIX = 'rl:gateway:';

const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local member = ARGV[4]

local windowStart = now - windowMs
redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

local currentCount = redis.call('ZCARD', key)
if currentCount >= maxRequests then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retryAfterMs = windowMs
  if #oldest >= 2 then
    retryAfterMs = math.max(1, (tonumber(oldest[2]) + windowMs) - now)
  end
  return {0, currentCount, retryAfterMs}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, windowMs)
return {1, currentCount + 1, windowMs}
`;

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly redisClient: Redis;

  constructor(configService: ConfigService) {
    const redisHost =
      configService.get<string>(GatewayEnvKey.REDIS_HOST)?.trim() ||
      'localhost';
    const redisPort =
      Number(configService.get<string>(GatewayEnvKey.REDIS_PORT)) ||
      DEFAULT_REDIS_PORT;
    const redisPassword =
      configService.get<string>(GatewayEnvKey.REDIS_PASSWORD)?.trim() ||
      undefined;

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.redisClient.on('error', (err: Error) => {
      this.logger.warn(
        `[Redis RateLimit] ${redisHost}:${redisPort} - ${err.message}`,
      );
    });
  }

  async checkRateLimit(clientIp: string): Promise<RateLimitDecision> {
    const key = `${REDIS_KEY_PREFIX}${clientIp}`;
    const now = Date.now();
    const member = `${now}-${randomUUID()}`;

    try {
      const result = (await this.redisClient.eval(
        SLIDING_WINDOW_LUA,
        1,
        key,
        now.toString(),
        RATE_LIMIT_WINDOW_MS.toString(),
        RATE_LIMIT_MAX.toString(),
        member,
      )) as [number, number, number];

      const allowed = Number(result[0]) !== 0;
      const currentCount = Number(result[1]);
      const retryAfterMs = Number(result[2]);

      return {
        allowed,
        limit: RATE_LIMIT_MAX,
        remaining: Math.max(0, RATE_LIMIT_MAX - currentCount),
        resetSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `[Redis RateLimit] Fail-open for IP ${clientIp}: ${message}`,
      );
      return {
        allowed: true,
        limit: RATE_LIMIT_MAX,
        remaining: RATE_LIMIT_MAX,
        resetSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient.status === 'ready') {
      await this.redisClient.quit().catch(() => {});
      return;
    }

    this.redisClient.disconnect();
  }
}
