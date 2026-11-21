import type { IncomingMessage } from 'node:http';
import { isFromTrustedProxy, resolveClientIp } from '../client-ip.util';
import { resolveCorrelationId } from '../correlation-id.util';

function makeReq(
  remoteAddress?: string,
  xForwardedFor?: string | string[],
): IncomingMessage {
  return {
    socket: { remoteAddress },
    headers:
      xForwardedFor !== undefined ? { 'x-forwarded-for': xForwardedFor } : {},
  } as unknown as IncomingMessage;
}

describe('client-ip.util', () => {
  it('recognizes loopback and private IPv4/IPv6 proxies accurately', () => {
    expect(isFromTrustedProxy(makeReq('127.0.0.1'))).toBe(true);
    expect(isFromTrustedProxy(makeReq('::1'))).toBe(true);
    expect(isFromTrustedProxy(makeReq('::ffff:172.18.0.2'))).toBe(true);
    expect(isFromTrustedProxy(makeReq('fc00::1'))).toBe(true);
    expect(isFromTrustedProxy(makeReq('fe80::1'))).toBe(true);

    expect(isFromTrustedProxy(makeReq('172.32.0.1'))).toBe(false);
    expect(isFromTrustedProxy(makeReq('203.0.113.50'))).toBe(false);
    expect(isFromTrustedProxy(makeReq('fc::1'))).toBe(false);
    expect(isFromTrustedProxy(makeReq('fe8::1'))).toBe(false);
  });

  it('ignores X-Forwarded-For when immediate socket is untrusted', () => {
    expect(resolveClientIp(makeReq('203.0.113.50', '1.2.3.4'))).toBe(
      '203.0.113.50',
    );
    expect(resolveClientIp(makeReq(undefined))).toBe('anonymous');
  });

  it('walks right-to-left from trusted proxy and strips spoofed prefixes', () => {
    expect(
      resolveClientIp(
        makeReq('::ffff:172.18.0.2', '1.2.3.4, 5.6.7.8, 203.0.113.77'),
      ),
    ).toBe('203.0.113.77');

    expect(
      resolveClientIp(
        makeReq('127.0.0.1', '1.2.3.4, 198.51.100.12, 172.18.0.3'),
      ),
    ).toBe('198.51.100.12');
  });
});

describe('correlation-id.util', () => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('accepts valid correlation IDs up to 64 safe characters', () => {
    expect(resolveCorrelationId('trace-req_123.abc')).toBe('trace-req_123.abc');
    expect(resolveCorrelationId('  req-01  ')).toBe('req-01');
  });

  it('replaces missing, invalid, oversized, or array IDs with UUIDv4', () => {
    expect(resolveCorrelationId(undefined)).toMatch(uuidRegex);
    expect(resolveCorrelationId('')).toMatch(uuidRegex);
    expect(resolveCorrelationId('bad id with spaces')).toMatch(uuidRegex);
    expect(resolveCorrelationId('bad\r\nInjected: header')).toMatch(uuidRegex);
    expect(resolveCorrelationId('a'.repeat(65))).toMatch(uuidRegex);
    expect(resolveCorrelationId(['id-1', 'id-2'])).toMatch(uuidRegex);
  });
});
