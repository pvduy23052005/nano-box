import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from  'socket.io';
import { WebsocketService } from './ws.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
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

  handleConnection() {}

  handleDisconnect() {}
}
