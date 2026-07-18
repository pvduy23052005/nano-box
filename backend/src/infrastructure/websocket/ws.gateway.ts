import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './ws.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.websocketService.server = server;
  }

  handleConnection(_client: Socket) {}

  handleDisconnect(_client: Socket) {}
}
