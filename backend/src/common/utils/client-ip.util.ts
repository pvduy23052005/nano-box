import { IncomingMessage } from 'http';

export function extractClientIp(
  req: IncomingMessage & { ip?: string },
): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp: string | undefined;

  if (typeof forwarded === 'string') {
    rawIp = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].split(',')[0].trim();
  } else {
    rawIp =
      (req.headers['x-real-ip'] as string | undefined) ||
      req.ip ||
      req.socket?.remoteAddress;
  }

  return rawIp ? rawIp.replace(/^::ffff:/, '') : undefined;
}
