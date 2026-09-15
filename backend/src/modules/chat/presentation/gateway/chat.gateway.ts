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
import { RoomRepositoryAdapter } from 'src/modules/room/application/ports/room.ports';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  @SubscribeMessage(eventType.CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING)
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: eventType.TypingPayload,
  ) {
    const userIdTyping = client.data.userId;
    if (!payload?.roomId || !userIdTyping) return;

    const room = await this.roomRepository.findById(payload.roomId);
    if (!room) return;

    const isMember = room.members?.some(
      (member) => member.userId === userIdTyping,
    );
    if (!isMember) return;

    const recipientUserIds = room.members
      .filter((member) => member.userId !== userIdTyping)
      .map((member) => member.userId);

    const targets = [...recipientUserIds, payload.roomId];

    if (targets.length > 0) {
      this.server
        .to(targets)
        .emit(eventType.CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, {
          ...payload,
          userId: userIdTyping,
        });
    }
  }
}
