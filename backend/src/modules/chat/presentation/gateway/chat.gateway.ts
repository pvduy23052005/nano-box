import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as eventType from './event.type';
import type { AuthenticatedSocket } from 'src/infrastructure/websocket/ws.type';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING)
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.TypingPayload,
  ) {
    const userId = client.data.userId;

    this.server.emit(eventType.CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, {
      ...payload,
      userId,
    });
  }
}
