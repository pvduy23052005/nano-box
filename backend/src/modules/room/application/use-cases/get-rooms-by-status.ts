import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomProps } from '../../domain/room.type';
import { MemberStatus } from '../../domain/chat.enum';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class GetRoomsByStatusUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    userId: string,
    status: MemberStatus,
    search?: string,
  ): Promise<RoomProps[]> {
    if (!Object.values(MemberStatus).includes(status)) {
      throw new DomainValidationException({
        status: 'Trạng thái không hợp lệ',
      });
    }

    return await this.roomRepository.findRoomsByUserIdAndStatus(
      userId,
      status,
      search,
    );
  }
}
