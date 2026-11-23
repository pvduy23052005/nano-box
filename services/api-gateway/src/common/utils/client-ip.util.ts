import type { IncomingMessage } from 'node:http';
import proxyAddr from 'proxy-addr';

export const TRUSTED_PROXY_SUBNETS = ['loopback', 'linklocal', 'uniquelocal'];

const isTrustedProxy = proxyAddr.compile(TRUSTED_PROXY_SUBNETS);

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
