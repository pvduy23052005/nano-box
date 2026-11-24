import { randomUUID } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import Redis from 'ioredis';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const DEFAULT_REDIS_PORT = 6379;
const REDIS_CONNECT_TIMEOUT_MS = 3_000;
const HEALTH_PING_TIMEOUT_MS = 2_000;
const REDIS_KEY_PREFIX = 'rl:upload:';

export interface DependencyHealth {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

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

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const rawHost = this.configService.get<string>('REDIS_HOST');
    const redisHost =
      rawHost && rawHost.trim().length > 0 ? rawHost.trim() : 'localhost';

    const rawPort = this.configService.get<string>('REDIS_PORT');
    const parsedPort = rawPort ? Number(rawPort) : NaN;
    const redisPort =
      Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65_535
        ? parsedPort
        : DEFAULT_REDIS_PORT;

    const rawPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisPassword =
      rawPassword && rawPassword.trim().length > 0
        ? rawPassword.trim()
        : undefined;

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.redisClient.on('connect', () => {
      this.logger.log(
        `Upload rate limiter connected to Redis at ${redisHost}:${redisPort}`,
      );
    });

    this.redisClient.on('error', (error: Error) => {
      this.logger.warn(
        `[Redis UploadRateLimit] Connection error (${redisHost}:${redisPort}): ${error.message}`,
      );
    });
  }

  async checkRedisHealth(): Promise<DependencyHealth> {
    const start = Date.now();
    let timer: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Redis ping timed out')),
          HEALTH_PING_TIMEOUT_MS,
        );
      });

      const response: string = await Promise.race([
        this.redisClient.ping(),
        timeoutPromise,
      ]);

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
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit().catch(() => {});
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const forwardedFor = request.headers['x-forwarded-for']
      ?.toString()
      .split(',')[0]
      ?.trim();
    const identifier =
      request.user?.id || request.ip || forwardedFor || 'anonymous';
    const key = `${REDIS_KEY_PREFIX}${identifier}`;

    const now = Date.now();
    const member = `${now}-${randomUUID()}`;

    let allowed = 1;
    let retryAfterMs = RATE_LIMIT_WINDOW_MS;

    try {
      const result = (await this.redisClient.eval(
        SLIDING_WINDOW_LUA,
        1,
        key,
        now.toString(),
        RATE_LIMIT_WINDOW_MS.toString(),
        RATE_LIMIT_MAX_REQUESTS.toString(),
        member,
      )) as [number, number, number];

      allowed = Number(result[0]);
      retryAfterMs = Number(result[2]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `[Redis UploadRateLimit] Fail-open for key "${key}": ${message}`,
      );
      return true;
    }

    if (allowed === 0) {
      const response = context.switchToHttp().getResponse<Response>();
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('Retry-After', retryAfterSeconds.toString());
      }

      throw new HttpException(
        'Bạn đã tải lên quá nhiều lần. Vui lòng thử lại sau 1 phút',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
