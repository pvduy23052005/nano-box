import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
  private debounceMs = 5000;

  setDebounceMs(ms: number): void {
    this.debounceMs = ms;
  }

  addConnection(userId: string, socketId: string): boolean {
    const wasOnline = this.isUserOnline(userId);

    const activeTimer = this.disconnectTimers.get(userId);
    if (activeTimer) {
      clearTimeout(activeTimer);
      this.disconnectTimers.delete(userId);
    }

    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set<string>();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);

    return !wasOnline;
  }

  removeConnection(
    userId: string,
    socketId: string,
    onOffline: () => void,
  ): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      const existingTimer = this.disconnectTimers.get(userId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        this.disconnectTimers.delete(userId);
        this.userSockets.delete(userId);
        onOffline();
      }, this.debounceMs);

      this.disconnectTimers.set(userId, timer);
    }
  }

  removeUserImmediately(userId: string, onOffline: () => void): void {
    const timer = this.disconnectTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(userId);
    }

    const wasOnline = this.isUserOnline(userId);
    this.userSockets.delete(userId);

    if (wasOnline) {
      onOffline();
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    const hasSockets = !!sockets && sockets.size > 0;
    return hasSockets || this.disconnectTimers.has(userId);
  }

  getOnlineUserIds(): string[] {
    const onlineIds = new Set<string>();
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.size > 0) {
        onlineIds.add(userId);
      }
    }
    for (const userId of this.disconnectTimers.keys()) {
      onlineIds.add(userId);
    }
    return Array.from(onlineIds);
  }

  onModuleDestroy(): void {
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
    this.userSockets.clear();
  }
}
