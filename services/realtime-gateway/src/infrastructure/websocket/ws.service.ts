import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WebsocketService {
  public server: Server | null = null;

  emitToRooms(rooms: string | string[], event: string, payload: unknown): void {
    const trimmedEvent = event.trim();
    if (!trimmedEvent) {
      return;
    }

    const validRooms = this.normalizeRooms(rooms);
    if (validRooms.length === 0) {
      return;
    }

    if (!this.server) {
      throw new Error('Socket.IO server is not initialized');
    }

    this.server.to(validRooms).emit(trimmedEvent, payload);
  }

  leaveRoom(rooms: string | string[], roomToLeave: string): void {
    const trimmedRoom = roomToLeave.trim();
    if (!trimmedRoom) {
      return;
    }

    const validRooms = this.normalizeRooms(rooms);
    if (validRooms.length === 0) {
      return;
    }

    if (!this.server) {
      throw new Error('Socket.IO server is not initialized');
    }

    this.server.in(validRooms).socketsLeave(trimmedRoom);
  }

  private normalizeRooms(rooms: string | string[]): string[] {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    return roomList
      .filter((room): room is string => typeof room === 'string')
      .map((room) => room.trim())
      .filter(Boolean);
  }
}
