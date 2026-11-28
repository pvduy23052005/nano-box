import {
  RealtimeEventType,
  type RealtimeEventMessage,
} from './realtime.type';
import { Injectable, Logger } from '@nestjs/common';
import { RABBITMQ_TOPOLOGY } from '../configs/rabbitmq.config';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class RealtimePublisherService {
  private readonly logger = new Logger(RealtimePublisherService.name);
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async emit(
    rooms: string | string[],
    event: string,
    payload: unknown,
  ): Promise<void> {
    const roomList = this.normalizeRooms(rooms);
    const trimmedEvent = event.trim();
    if (roomList.length === 0 || !trimmedEvent) {
      return;
    }

    await this.publishCommand({
      type: RealtimeEventType.EMIT,
      rooms: roomList,
      event: trimmedEvent,
      payload,
    });
  }

  async socketsLeave(
    rooms: string | string[],
    leaveRoomId: string,
  ): Promise<void> {
    const roomList = this.normalizeRooms(rooms);
    const trimmedLeaveRoomId = leaveRoomId.trim();
    if (roomList.length === 0 || !trimmedLeaveRoomId) {
      return;
    }

    await this.publishCommand({
      type: RealtimeEventType.SOCKETS_LEAVE,
      rooms: roomList,
      leaveRoomId: trimmedLeaveRoomId,
    });
  }

  private normalizeRooms(rooms: string | string[]): string[] {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    return Array.from(
      new Set(
        roomList
          .filter((room): room is string => typeof room === 'string')
          .map((room) => room.trim())
          .filter(Boolean),
      ),
    );
  }

  private async publishCommand(message: RealtimeEventMessage): Promise<void> {
    try {
      await this.rabbitmqService.publish(
        RABBITMQ_TOPOLOGY.EXCHANGES.REALTIME_EVENTS,
        '',
        message,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish realtime command "${message.type}"`,
        error,
      );
    }
  }
}
