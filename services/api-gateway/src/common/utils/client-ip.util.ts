import type { IncomingMessage } from 'node:http';
import proxyAddr from 'proxy-addr';

/** Same subnets as Express `trust proxy`: only internal hops may set X-Forwarded-For. */
export const TRUSTED_PROXY_SUBNETS = ['loopback', 'linklocal', 'uniquelocal'];

const isTrustedProxy = proxyAddr.compile(TRUSTED_PROXY_SUBNETS);

/**
 * Resolves the real client IP by walking X-Forwarded-For right-to-left and
 * stopping at the first hop that is not a trusted internal proxy.
 */
export function resolveClientIp(req: IncomingMessage): string {
  if (!req.socket?.remoteAddress) {
    return 'anonymous';
  }

  return proxyAddr(req, isTrustedProxy).replace(/^::ffff:/, '');
}

export function isFromTrustedProxy(req: IncomingMessage): boolean {
  const remoteAddress = req.socket?.remoteAddress;
  return Boolean(remoteAddress) && isTrustedProxy(remoteAddress as string, 0);
}
