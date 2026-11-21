import { randomUUID } from 'node:crypto';

const VALID_CORRELATION_ID_REGEX = /^[a-zA-Z0-9._-]{1,64}$/;

export function resolveCorrelationId(
  rawHeader: string | string[] | undefined,
): string {
  if (typeof rawHeader === 'string') {
    const trimmed = rawHeader.trim();
    if (VALID_CORRELATION_ID_REGEX.test(trimmed)) {
      return trimmed;
    }
  }

  return randomUUID();
}
