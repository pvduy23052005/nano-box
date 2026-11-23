import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export interface RevokeRoomAdminInputProps {
  roomId: string;
  userId: string;
}

export class RevokeRoomAdminUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    myId: string,
    input: RevokeRoomAdminInputProps,
  ): Promise<RoomProps> {
    const room = await this.roomRepository.findById(input.roomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const roomEntity = RoomEntity.restore(room);
    roomEntity.revokeAdmin(myId, input.userId);

    return await this.roomRepository.save(roomEntity);
  }
}
