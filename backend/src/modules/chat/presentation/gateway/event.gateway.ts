import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SOCKET_EVENTS } from './event.type';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import type { MessageState } from '../../domain/message.type';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/common/guards/ws.guard';
import type { SockeAuth } from 'src/common/guards/ws.guard';

@WebSocketGateway()
export class EventGateway {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(SOCKET_EVENTS.CHAT.SEND_MESSAGE)
  async sendMessage(
    @MessageBody() messageData: MessageState,
    @ConnectedSocket() client: SockeAuth,
  ) {
    const curentUserId = client.data.user.id;
    const data = await this.sendMessageUseCase.execute({
      ...messageData,
      senderId: curentUserId,
    });
    const server = this.websocketService.server;
    if (server) {
      server.emit(SOCKET_EVENTS.CHAT.RECEIVE_MESSAGE, data);
    }
  }
}
