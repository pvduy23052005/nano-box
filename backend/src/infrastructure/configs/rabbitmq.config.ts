import { registerAs } from '@nestjs/config';

export const RABBITMQ_TOPOLOGY = {
  EXCHANGES: {
    NOTIFICATION_EVENTS: 'notification.events',
    NOTIFICATION_REALTIME: 'notification.realtime',
    NOTIFICATION_DLX: 'notification.dlx',
    REALTIME_EVENTS: 'realtime.events',
  },
  QUEUES: {
    NOTIFICATION_CREATE: 'notification.create.queue',
    NOTIFICATION_DLQ: 'notification.dlq',
  },
  ROUTING_KEYS: {
    NOTIFICATION_ALL: 'notification.#',
    NOTIFICATION_DEAD: 'notification.dead',
  },
} as const;

export const rabbitmqConfig = registerAs('rabbitmq', () => {
  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.RABBITMQ_URL;

  if (isProd && !url) {
    throw new Error('RABBITMQ_URL is required in production');
  }

  return {
    url: url || 'amqp://nanobox:nanobox_secret@localhost:5672',
    prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
  };
});
