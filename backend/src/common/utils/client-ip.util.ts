import { IncomingMessage } from 'http';

export function extractClientIp(
  req: IncomingMessage & { ip?: string },
): string | undefined {
  if (!req) return undefined;
  const rawIp = req.ip || req.socket?.remoteAddress;
  return rawIp ? rawIp.replace(/^::ffff:/, '') : undefined;
}
