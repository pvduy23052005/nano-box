import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import {
  NOTIFICATION_EVENTS,
  type RoomMemberAddedEventPayload,
} from 'src/modules/notification/presentation/listener/notification.event';
import { CHAT_SOCKET_EVENTS } from '../gateway/event.type';
import { SendSystemMessageUseCase } from '../../application/use-cases/send-system-message.use-case';

@Injectable()
export class ChatListener {
  private readonly logger = new Logger(ChatListener.name);

  constructor(
    private readonly sendSystemMessageUseCase: SendSystemMessageUseCase,
    private readonly userRepository: UserRepositoryAdapter,
    private readonly websocketService: WebsocketService,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.ROOM_MEMBER_ADDED)
  async handleRoomMemberAdded(
    payload: RoomMemberAddedEventPayload,
  ): Promise<void> {
    try {
      const {
        roomId,
        adderId,
        adderName: payloadAdderName,
        addedUserId,
        addedUserName: payloadAddedUserName,
        memberIds,
      } = payload;

      if (!roomId || !adderId || !addedUserId) return;

      let adderName = payloadAdderName;
      if (!adderName) {
        const adder = await this.userRepository.findById(adderId);
        adderName = adder?.getName();
      }

      let addedUserName = payloadAddedUserName;
      if (!addedUserName) {
        const addedUser = await this.userRepository.findById(addedUserId);
        addedUserName = addedUser?.getName();
      }

      const displayAdder = adderName || 'Quản trị viên';
      const displayAdded = addedUserName || 'thành viên';
      const content = `${displayAdder} đã thêm ${displayAdded} vào nhóm`;

      const { message, memberIds: roomMemberIds } =
        await this.sendSystemMessageUseCase.execute({
          roomId,
          content,
          senderName: 'Hệ thống',
        });

      const recipientIds = Array.from(
        new Set([...(memberIds || []), ...(roomMemberIds || [])]),
      );

      this.websocketService.server
        ?.to([...recipientIds, roomId])
        ?.emit(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    } catch (error) {
      this.logger.error('Error handling room.member_added in ChatListener', error);
    }
  }
}
