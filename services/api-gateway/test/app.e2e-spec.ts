import * as http from 'node:http';
import * as net from 'node:net';
import type { AddressInfo } from 'node:net';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { RateLimitService } from '../src/common/services/rate-limit.service';
import { configureGatewayApp } from '../src/main';
import { GatewayProxyService } from '../src/proxy/gateway-proxy.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function startMockUpstream(
  handler: http.RequestListener,
): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

function sendRawHttpRequest(
  port: number,
  rawRequest: string,
  closeAfterHeaders = false,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      socket.write(rawRequest);
    });

    let responseData = '';
    socket.on('data', (chunk) => {
      responseData += chunk.toString('utf8');
      if (closeAfterHeaders && responseData.includes('\r\n\r\n')) {
        socket.end();
      }
    });
    socket.on('end', () => resolve(responseData));
    socket.on('close', () => resolve(responseData));
    socket.on('error', reject);
  });
}

function sendNodeHttpPost(
  port: number,
  path: string,
  headers: Record<string, string>,
  body: string,
): Promise<{
  statusCode: number | undefined;
  headers: http.IncomingHttpHeaders;
  body: Record<string, unknown>;
}> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method: 'POST',
        path,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body).toString(),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (chunk: Buffer) => {
          chunks += chunk.toString('utf8');
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(chunks) as Record<string, unknown>,
          });
        });
      },
    );
    req.on('error', reject);
    req.on('continue', () => {
      req.end(body);
    });
    if (headers['Expect']?.toLowerCase() !== '100-continue') {
      req.end(body);
    }
  });
}

function sendRawUpgradeRequest(
  port: number,
  path: string,
  headers: Record<string, string>,
): Promise<string> {
  const headerLines = [
    `GET ${path} HTTP/1.1`,
    `Host: 127.0.0.1:${port}`,
    'Connection: Upgrade',
    'Upgrade: websocket',
    'Sec-WebSocket-Version: 13',
    'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
    ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
  ];
  return sendRawHttpRequest(port, `${headerLines.join('\r\n')}\r\n\r\n`, true);
}

describe('API Gateway (e2e)', () => {
  let app: NestExpressApplication;
  let gatewayPort: number;
  let rateLimitService: RateLimitService;
  let mockBackend: { server: http.Server; url: string };
  let mockUpload: { server: http.Server; url: string };

  beforeAll(async () => {
    mockBackend = await startMockUpstream((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          upstream: 'backend',
          url: req.url,
          correlationId: req.headers['x-correlation-id'],
          forwardedFor: req.headers['x-forwarded-for'],
          realIp: req.headers['x-real-ip'],
          forwardedProto: req.headers['x-forwarded-proto'],
          forwardedHost: req.headers['x-forwarded-host'],
          forwarded: req.headers['forwarded'],
          forwardedPort: req.headers['x-forwarded-port'],
          cfConnectingIp: req.headers['cf-connecting-ip'],
          trueClientIp: req.headers['true-client-ip'],
        }),
      );
    });

    mockBackend.server.on('upgrade', (req, socket) => {
      const correlationId = String(req.headers['x-correlation-id'] || '');
      const forwardedFor = String(req.headers['x-forwarded-for'] || '');
      const realIp = String(req.headers['x-real-ip'] || '');
      const forwardedProto = String(req.headers['x-forwarded-proto'] || '');
      socket.write(
        [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `x-echo-correlation-id: ${correlationId}`,
          `x-echo-forwarded-for: ${forwardedFor}`,
          `x-echo-real-ip: ${realIp}`,
          `x-echo-forwarded-proto: ${forwardedProto}`,
          '',
          '',
        ].join('\r\n'),
      );
      socket.end();
    });

    mockUpload = await startMockUpstream((req, res) => {
      // Simulate permissive upstream CORS to verify gateway strips it
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.origin ?? '*',
        'Access-Control-Allow-Credentials': 'true',
      });
      res.end(
        JSON.stringify({
          upstream: 'upload',
          url: req.url,
          correlationId: req.headers['x-correlation-id'],
          forwardedFor: req.headers['x-forwarded-for'],
          realIp: req.headers['x-real-ip'],
          forwardedProto: req.headers['x-forwarded-proto'],
          forwardedHost: req.headers['x-forwarded-host'],
        }),
      );
    });

    process.env.BACKEND_SERVICE_URL = mockBackend.url;
    process.env.UPLOAD_SERVICE_URL = mockUpload.url;
    process.env.ALLOWED_ORIGINS = 'https://nano-boxes.id.vn';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });

    configureGatewayApp(app);
    await app.init();

    const gatewayProxyService = app.get(GatewayProxyService);
    rateLimitService = app.get(RateLimitService);
    const httpServer = app.getHttpServer();
    gatewayProxyService.attachWebSocketUpgrade(httpServer);

    await app.listen(0, '127.0.0.1');
    gatewayPort = (httpServer.address() as AddressInfo).port;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await Promise.all([
      closeServer(mockBackend.server),
      closeServer(mockUpload.server),
    ]);
  });

  it('GET /health returns 200, correlation id, and hides x-powered-by', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'api-gateway',
      }),
    );
    expect(res.headers['x-correlation-id']).toMatch(UUID_REGEX);
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('proxies /graphql with verified forwarding and correlation headers', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Origin', 'https://nano-boxes.id.vn')
      .set('x-correlation-id', 'e2e-trace-1')
      .set('x-forwarded-proto', 'https')
      .send({ query: '{ __typename }' })
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBe(
      'https://nano-boxes.id.vn',
    );
    expect(res.body).toEqual(
      expect.objectContaining({
        upstream: 'backend',
        url: '/graphql',
        correlationId: 'e2e-trace-1',
        forwardedProto: 'https',
      }),
    );
    expect(
      (res.body as { forwardedHost?: string }).forwardedHost,
    ).toBeDefined();
  });

  it('blocks Expect: 100-continue bypass and strips smuggling headers', async () => {
    const res = await sendNodeHttpPost(
      gatewayPort,
      '/graphql',
      {
        Expect: '100-continue',
        'x-forwarded-for': '1.2.3.4, 203.0.113.77',
        'x-real-ip': '9.9.9.9',
        'x-forwarded-host': 'evil.example.com',
        'x-forwarded-port': '9999',
        forwarded: 'for=1.2.3.4;host=evil.example.com',
        'cf-connecting-ip': '1.2.3.4',
        'true-client-ip': '1.2.3.4',
        'x-correlation-id': 'bad id with spaces',
      },
      JSON.stringify({ query: '{ __typename }' }),
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-correlation-id']).toMatch(UUID_REGEX);
    expect(res.body).toEqual({
      upstream: 'backend',
      url: '/graphql',
      correlationId: res.headers['x-correlation-id'],
      forwardedFor: '203.0.113.77',
      realIp: '203.0.113.77',
      forwardedProto: 'http',
      forwardedHost: `127.0.0.1:${gatewayPort}`,
    });
  });

  it('drops spoofed x-forwarded-host when Host header is missing on HTTP/1.0', async () => {
    const rawRes = await sendRawHttpRequest(
      gatewayPort,
      [
        'GET /graphql HTTP/1.0',
        'X-Forwarded-Host: evil.example.com',
        'X-Forwarded-For: 1.2.3.4, 203.0.113.55',
        '',
        '',
      ].join('\r\n'),
    );

    const bodyStart = rawRes.indexOf('\r\n\r\n');
    const jsonBody = JSON.parse(rawRes.slice(bodyStart + 4)) as {
      forwardedFor?: string;
      forwardedHost?: string;
    };

    expect(jsonBody.forwardedFor).toBe('203.0.113.55');
    expect(jsonBody.forwardedHost).toBeUndefined();
  });

  it('strips permissive CORS and sanitizes forwarding headers on /upload', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload')
      .set('Origin', 'https://evil.example.com')
      .set('x-forwarded-for', '1.2.3.4, 203.0.113.66')
      .set('x-forwarded-proto', 'http, https')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    expect(res.body).toEqual(
      expect.objectContaining({
        upstream: 'upload',
        url: '/upload',
        forwardedFor: '203.0.113.66',
        realIp: '203.0.113.66',
        forwardedProto: 'https',
      }),
    );
  });

  it('returns 429 on HTTP when RateLimitService rejects a request', async () => {
    jest.spyOn(rateLimitService, 'checkRateLimit').mockResolvedValueOnce({
      allowed: false,
      limit: 120,
      remaining: 0,
      resetSeconds: 45,
    });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ __typename }' })
      .expect(429);

    expect(res.headers['retry-after']).toBe('45');
    expect(res.headers['ratelimit-remaining']).toBe('0');
    expect(res.body).toEqual(
      expect.objectContaining({
        statusCode: 429,
        error: 'Too Many Requests',
      }),
    );
  });

  it('guards WebSocket upgrades (traversal, CORS, rate limit, spoofing)', async () => {
    const traversalRes = await sendRawUpgradeRequest(
      gatewayPort,
      '/socket.io/../graphql',
      {},
    );
    expect(traversalRes).toContain('HTTP/1.1 404 Not Found');
    expect(traversalRes).toMatch(/x-correlation-id:\s*[0-9a-f-]{36}/i);

    const encodedTraversalRes = await sendRawUpgradeRequest(
      gatewayPort,
      '/socket.io/%2e%2e/admin',
      {},
    );
    expect(encodedTraversalRes).toContain('HTTP/1.1 404 Not Found');

    const badOriginRes = await sendRawUpgradeRequest(
      gatewayPort,
      '/socket.io/?EIO=4&transport=websocket',
      { Origin: 'https://evil.example.com' },
    );
    expect(badOriginRes).toContain('HTTP/1.1 403 Forbidden');
    expect(badOriginRes).toMatch(/x-correlation-id:\s*[0-9a-f-]{36}/i);

    jest.spyOn(rateLimitService, 'checkRateLimit').mockResolvedValueOnce({
      allowed: false,
      limit: 120,
      remaining: 0,
      resetSeconds: 30,
    });
    const rateLimitedWsRes = await sendRawUpgradeRequest(
      gatewayPort,
      '/socket.io/?EIO=4&transport=websocket',
      { Origin: 'https://nano-boxes.id.vn' },
    );
    expect(rateLimitedWsRes).toContain('HTTP/1.1 429 Too Many Requests');
    expect(rateLimitedWsRes).toContain('Retry-After: 30');

    const validUpgradeRes = await sendRawUpgradeRequest(
      gatewayPort,
      '/socket.io/?EIO=4&transport=websocket',
      {
        Origin: 'https://nano-boxes.id.vn',
        'x-forwarded-for': '1.2.3.4, 203.0.113.88',
        'x-real-ip': '9.9.9.9',
        'x-forwarded-proto': 'https',
        'x-correlation-id': 'bad ws id!',
      },
    );
    expect(validUpgradeRes).toContain('HTTP/1.1 101 Switching Protocols');
    expect(validUpgradeRes).toContain('x-echo-forwarded-for: 203.0.113.88');
    expect(validUpgradeRes).toContain('x-echo-real-ip: 203.0.113.88');
    expect(validUpgradeRes).toContain('x-echo-forwarded-proto: https');
    const echoedCorrMatch = validUpgradeRes.match(
      /x-echo-correlation-id: ([^\r\n]+)/i,
    );
    expect(echoedCorrMatch?.[1]).toMatch(UUID_REGEX);
  });

  it('returns 502 Bad Gateway when upstream is unreachable', async () => {
    await closeServer(mockUpload.server);

    const res = await request(app.getHttpServer()).post('/upload').expect(502);

    expect(res.body).toEqual(
      expect.objectContaining({
        statusCode: 502,
        error: 'Bad Gateway',
      }),
    );

    // Re-open dummy server so afterAll closeServer succeeds cleanly
    mockUpload = await startMockUpstream((_req, resObj) => {
      resObj.writeHead(200);
      resObj.end();
    });
  });
});
