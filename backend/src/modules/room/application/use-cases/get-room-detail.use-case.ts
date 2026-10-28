import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MemberStatus } from '../../domain/chat.enum';
import { RoomProps } from '../../domain/room.type';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export class GetRoomDetailUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(roomId: string, currentUserId: string): Promise<RoomProps> {
    const room = await this.roomRepository.findById(roomId, currentUserId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const member = room.members?.find(
      (member) => member.userId === currentUserId,
    );

    if (!member || member.status === MemberStatus.REFUSED) {
      throw new DomainValidationException(
        'member',
        'Bạn không có quyền truy cập vào phòng trò chuyện này',
      );
    }

    return room;
  }
}
