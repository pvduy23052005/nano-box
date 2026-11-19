import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MemberStatus } from '../../domain/chat.enum';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export interface UpdateMemberLastReadOutput {
  isSuccess: boolean;
  memberIds: string[];
}

export class UpdateMemberLastReadMessageUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<UpdateMemberLastReadOutput> {
    const cleanRoomId = roomId?.trim();
    const cleanMessageId = messageId?.trim();

    if (!cleanRoomId) {
      throw new DomainValidationException(
        'roomId',
        'ID phòng không được để trống',
      );
    }

    if (!cleanMessageId) {
      throw new DomainValidationException(
        'messageId',
        'ID tin nhắn không được để trống',
      );
    }

    const room = await this.roomRepository.findRoomMembers(cleanRoomId);
    if (!room) {
      throw new DomainValidationException('roomId', 'Phòng không tồn tại');
    }

    const member = room.members?.find((member) => member.userId === userId);
    if (!member || member.status !== MemberStatus.ACCEPTED) {
      throw new DomainValidationException(
        'member',
        'Bạn không phải là thành viên hợp lệ của phòng này',
      );
    }

    const isMessageValid = await this.roomRepository.isMessageInRoom(
      cleanRoomId,
      cleanMessageId,
    );
    if (!isMessageValid) {
      throw new DomainValidationException(
        'messageId',
        'Tin nhắn không tồn tại trong phòng trò chuyện',
      );
    }

    const isSuccess = await this.roomRepository.updateMemberLastReadMessage(
      cleanRoomId,
      userId,
      cleanMessageId,
    );

    const memberIds = room.members?.map((member) => member.userId) || [];

    return {
      isSuccess,
      memberIds,
    };
  }
}
