import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageType } from '../../domain/message.type';
import { PaginationResult } from '../dto/pagination.type';
import { MessageRepositoryAdapter } from '../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';

export class GetMessagesUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryAdapter,
    private readonly roomRepository: RoomRepositoryAdapter,
  ) {}

  async execute(
    roomId: string,
    userId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginationResult<MessageType>> {
    const errors: Record<string, string> = {};

    const room = await this.roomRepository.findRoomMembers(roomId);
    if (!room) {
      errors.roomId = 'Phòng chat không tồn tại';
    } else {
      const isMember = room.members?.some((member) => member.userId === userId);

      if (!isMember) {
        errors.permission =
          'Bạn không có quyền truy cập tin nhắn của phòng chat này';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const messages = await this.messageRepository.findAll({
      roomId,
      cursor,
      limit,
    });
    return messages;
  }
}
