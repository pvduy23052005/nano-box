import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SOCKET_EVENTS } from './event.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';

@WebSocketGateway()
export class EventGateway {
  constructor(private readonly websocketService: WebsocketService) { }

  @SubscribeMessage(SOCKET_EVENTS.CHAT.SEND_MESSAGE)
  sendMessage(@MessageBody() data: any) {
    const server = this.websocketService.server;
    if (server) {
      server.emit(SOCKET_EVENTS.CHAT.RECEIVE_MESSAGE, {
        message: data.message || ''
      });
    }
  }
}
