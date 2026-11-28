import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RABBITMQ_TOPOLOGY } from '../../infrastructure/configs/rabbitmq.config';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import {
  RealtimeEventType,
  type RealtimeEventMessage,
} from '../../infrastructure/rabbitmq/realtime-events.type';
import { WebsocketService } from '../../infrastructure/websocket/ws.service';

@Injectable()
export class RealtimeEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(RealtimeEventsConsumer.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly websocketService: WebsocketService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmqService.subscribeFanout<RealtimeEventMessage>(
      RABBITMQ_TOPOLOGY.EXCHANGES.REALTIME_EVENTS,
      (message) => {
        this.handleCommand(message);
        return Promise.resolve();
      },
    );

    this.logger.log(
      `Subscribed to fanout exchange "${RABBITMQ_TOPOLOGY.EXCHANGES.REALTIME_EVENTS}"`,
    );
  }

  private handleCommand(message: RealtimeEventMessage): void {
    switch (message?.type) {
      case RealtimeEventType.EMIT:
        this.websocketService.emitToRooms(
          message.rooms ?? [],
          message.event ?? '',
          message.payload,
        );
        return;

      case RealtimeEventType.SOCKETS_LEAVE:
        this.websocketService.leaveRoom(
          message.rooms ?? [],
          message.leaveRoomId ?? '',
        );
        return;

      default:
        throw new Error('Unsupported realtime event command type');
    }
  }
}
