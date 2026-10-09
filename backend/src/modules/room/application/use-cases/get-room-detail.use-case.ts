import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomProps } from '../../domain/room.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

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

    const isMember = room.members?.some(
      (member) => member.userId === currentUserId,
    );

    if (!isMember) {
      throw new DomainValidationException(
        'member',
        'Bạn không có quyền truy cập vào phòng trò chuyện này',
      );
    }

    return room;
  }
}
