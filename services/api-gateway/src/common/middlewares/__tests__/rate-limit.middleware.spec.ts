import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';
import { RateLimitService } from '../../services/rate-limit.service';
import { RateLimitMiddleware } from '../rate-limit.middleware';

interface MockResponse {
  headers: Record<string, string>;
  statusCode: number | null;
  body: unknown;
  writableEnded: boolean;
  destroyed: boolean;
  setHeader: jest.Mock;
  status: jest.Mock;
  json: jest.Mock;
}

function createMockResponse(): MockResponse {
  const mock: MockResponse = {
    headers: {},
    statusCode: null,
    body: null,
    writableEnded: false,
    destroyed: false,
    setHeader: jest.fn((key: string, value: string) => {
      mock.headers[key] = value;
    }),
    status: jest.fn((code: number) => {
      mock.statusCode = code;
      return mock;
    }),
    json: jest.fn((payload: unknown) => {
      mock.body = payload;
      return mock;
    }),
  };
  return mock;
}

describe('RateLimitMiddleware & RateLimitService', () => {
  let service: RateLimitService;
  let middleware: RateLimitMiddleware;
  let evalSpy: jest.SpyInstance;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue(''),
    } as unknown as ConfigService;

    service = new RateLimitService(configService);
    middleware = new RateLimitMiddleware(service);
    const internalClient = (
      service as unknown as {
        redisClient: { eval: jest.Mock; disconnect: jest.Mock };
      }
    ).redisClient;
    internalClient.disconnect();
    evalSpy = jest.spyOn(internalClient, 'eval');
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.restoreAllMocks();
  });

  it('skips rate limiting on /health and /health/', async () => {
    const req = {
      path: '/health/',
      headers: {},
      socket: { remoteAddress: '203.0.113.10' },
    } as unknown as Request;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    await middleware.use(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(evalSpy).not.toHaveBeenCalled();
  });

  it('allows requests within the sliding window and sets RateLimit headers', async () => {
    evalSpy.mockResolvedValue([1, 5, 60_000]);

    const req = {
      path: '/graphql',
      headers: {},
      socket: { remoteAddress: '203.0.113.10' },
    } as unknown as Request;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    await middleware.use(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.headers['RateLimit-Limit']).toBe('120');
    expect(res.headers['RateLimit-Remaining']).toBe('115');
    expect(res.headers['RateLimit-Reset']).toBe('60');
  });

  it('returns 429 Too Many Requests with Retry-After when limit is exceeded', async () => {
    evalSpy.mockResolvedValue([0, 120, 42_100]);

    const req = {
      path: '/graphql',
      headers: {},
      socket: { remoteAddress: '203.0.113.10' },
    } as unknown as Request;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    await middleware.use(req, res as unknown as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(429);
    expect(res.headers['Retry-After']).toBe('43');
    expect(res.headers['RateLimit-Remaining']).toBe('0');
    expect(res.body).toEqual(
      expect.objectContaining({
        statusCode: 429,
        error: 'Too Many Requests',
      }),
    );
  });

  it('fails open when Redis throws an error', async () => {
    evalSpy.mockRejectedValue(new Error('Redis down'));

    const req = {
      path: '/upload',
      headers: {},
      socket: { remoteAddress: '203.0.113.10' },
    } as unknown as Request;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    await middleware.use(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });
});
