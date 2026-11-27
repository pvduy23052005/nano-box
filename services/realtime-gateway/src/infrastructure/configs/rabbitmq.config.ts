import { registerAs } from '@nestjs/config';

export const DEFAULT_PREFETCH_COUNT = 10;

export const RABBITMQ_TOPOLOGY = {
  EXCHANGES: {
    NOTIFICATION_REALTIME: 'notification.realtime',
    REALTIME_EVENTS: 'realtime.events',
  },
} as const;

export const rabbitmqConfig = registerAs('rabbitmq', () => {
  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.RABBITMQ_URL;

  if (isProd && !url) {
    throw new Error('RABBITMQ_URL is required in production');
  }

  const parsedPrefetch = Number.parseInt(
    process.env.RABBITMQ_PREFETCH || String(DEFAULT_PREFETCH_COUNT),
    10,
  );

  return {
    url: url || 'amqp://nanobox:nanobox_secret@localhost:5672',
    prefetchCount:
      Number.isFinite(parsedPrefetch) && parsedPrefetch > 0
        ? parsedPrefetch
        : DEFAULT_PREFETCH_COUNT,
  };
});
