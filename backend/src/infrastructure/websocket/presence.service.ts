import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { REDIS_KEYS } from 'src/infrastructure/redis/redis.constant';

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
  private debounceMs = 5000;

  constructor(private readonly redisService: RedisService) {}

  setDebounceMs(debounceDurationMs: number): void {
    this.debounceMs = debounceDurationMs;
  }

  async addConnection(userId: string, socketId: string): Promise<boolean> {
    const activeDisconnectTimer = this.disconnectTimers.get(userId);
    if (activeDisconnectTimer) {
      clearTimeout(activeDisconnectTimer);
      this.disconnectTimers.delete(userId);
    }

    const userPresenceKey = REDIS_KEYS.PRESENCE(userId);
    const existingSocketCount = await this.redisService.sCard(userPresenceKey);
    const isFirstConnection = existingSocketCount === 0;

    await this.redisService.sAdd(userPresenceKey, socketId);
    await this.redisService.sAdd(REDIS_KEYS.ONLINE_USERS, userId);

    return isFirstConnection;
  }

  async removeConnection(
    userId: string,
    socketId: string,
    onOfflineCallback: () => void,
  ): Promise<void> {
    const userPresenceKey = REDIS_KEYS.PRESENCE(userId);
    await this.redisService.sRem(userPresenceKey, socketId);

    const remainingSocketCount = await this.redisService.sCard(userPresenceKey);
    if (remainingSocketCount === 0) {
      const activeDisconnectTimer = this.disconnectTimers.get(userId);
      if (activeDisconnectTimer) {
        clearTimeout(activeDisconnectTimer);
      }

      const timer = setTimeout(() => {
        void (async () => {
          this.disconnectTimers.delete(userId);
          const finalSocketCount =
            await this.redisService.sCard(userPresenceKey);

          if (finalSocketCount === 0) {
            await this.redisService.sRem(REDIS_KEYS.ONLINE_USERS, userId);
            await this.redisService.del(userPresenceKey);
            onOfflineCallback();
          }
        })();
      }, this.debounceMs);

      this.disconnectTimers.set(userId, timer);
    }
  }

  async removeUserImmediately(
    userId: string,
    onOfflineCallback: () => void,
  ): Promise<void> {
    const activeDisconnectTimer = this.disconnectTimers.get(userId);
    if (activeDisconnectTimer) {
      clearTimeout(activeDisconnectTimer);
      this.disconnectTimers.delete(userId);
    }

    const wasAlreadyOnline = await this.isUserOnline(userId);
    const userPresenceKey = REDIS_KEYS.PRESENCE(userId);

    await this.redisService.del(userPresenceKey);
    await this.redisService.sRem(REDIS_KEYS.ONLINE_USERS, userId);

    if (wasAlreadyOnline) {
      onOfflineCallback();
    }
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const userPresenceKey = REDIS_KEYS.PRESENCE(userId);
    const socketCount = await this.redisService.sCard(userPresenceKey);
    const hasPendingDisconnect = this.disconnectTimers.has(userId);

    return socketCount > 0 || hasPendingDisconnect;
  }

  async filterOnlineUsers(userIdsToCheck: string[]): Promise<string[]> {
    if (userIdsToCheck.length === 0) {
      return [];
    }

    const membershipFlags = await this.redisService.smIsMember(
      REDIS_KEYS.ONLINE_USERS,
      ...userIdsToCheck,
    );

    const onlineUserIds: string[] = [];
    for (let index = 0; index < userIdsToCheck.length; index += 1) {
      const candidateUserId = userIdsToCheck[index];
      const isOnlineInRedis = membershipFlags[index] === 1;
      const isPendingDisconnect = this.disconnectTimers.has(candidateUserId);

      if (isOnlineInRedis || isPendingDisconnect) {
        onlineUserIds.push(candidateUserId);
      }
    }

    return onlineUserIds;
  }

  onModuleDestroy(): void {
    for (const activeTimer of this.disconnectTimers.values()) {
      clearTimeout(activeTimer);
    }
    this.disconnectTimers.clear();
  }
}
