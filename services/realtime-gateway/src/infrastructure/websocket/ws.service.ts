import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WebsocketService {
  public server: Server | null = null;

  emitToRooms(rooms: string | string[], event: string, payload: unknown): void {
    if (!this.server) {
      return;
    }

    if (Array.isArray(rooms)) {
      const validRooms = rooms.filter(Boolean);
      if (validRooms.length === 0) {
        return;
      }
      this.server.to(validRooms).emit(event, payload);
      return;
    }

    if (!rooms) {
      return;
    }

    this.server.to(rooms).emit(event, payload);
  }
}
