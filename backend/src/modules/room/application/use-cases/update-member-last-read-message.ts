import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
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
    const room = await this.roomRepository.findRoomMembers(roomId);
    const isMember = room?.members?.some((member) => member.userId === userId);

    const errors: Record<string, string> = {};
    if (!room) {
      errors.roomId = 'Phòng không tồn tại';
    }

    if (!isMember) {
      errors.member = 'Bạn không là phải thành viên của phòng này';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const isSuccess = await this.roomRepository.updateMemberLastReadMessage(
      roomId,
      userId,
      messageId,
    );

    const memberIds = room?.members?.map((member) => member.userId) || [];

    return {
      isSuccess,
      memberIds,
    };
  }
}
