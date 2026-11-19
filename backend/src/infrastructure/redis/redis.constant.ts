export const REDIS_CLIENT = 'REDIS_CLIENT';

export const REDIS_KEYS = {
  PRESENCE: (userId: string): string => `presence:user:${userId}`,
  ONLINE_USERS: 'presence:online_users',
  RELATED_USERS: (userId: string): string => `presence:related:${userId}`,
} as const;
