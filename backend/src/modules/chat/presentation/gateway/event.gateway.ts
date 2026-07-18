import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SOCKET_EVENTS } from './event.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import type { MessageState } from '../../domain/message.type';

@WebSocketGateway()
export class EventGateway {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly sendMessageUseCase: SendMessageUseCase

  ) { }

  @SubscribeMessage(SOCKET_EVENTS.CHAT.SEND_MESSAGE)
  async sendMessage(@MessageBody() messageData: MessageState) {

    const data = await this.sendMessageUseCase.execute(messageData);

    const server = this.websocketService.server;
    if (server) {
      server.emit(SOCKET_EVENTS.CHAT.RECEIVE_MESSAGE, data);
    }
  }
}
