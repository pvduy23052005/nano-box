export type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost',
  'http://localhost',
];

export function parseAllowedOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [...DEFAULT_ALLOWED_ORIGINS];
  }

  const parsed = rawOrigins
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...DEFAULT_ALLOWED_ORIGINS];
}

export function createCorsOriginValidator(
  rawOrigins?: string,
): (origin: string | undefined, callback: CorsOriginCallback) => void {
  const allowedOrigins = parseAllowedOrigins(rawOrigins);

  return (origin: string | undefined, callback: CorsOriginCallback): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    callback(null, allowedOrigins.includes(normalizedOrigin));
  };
}
