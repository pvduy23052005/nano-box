import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export interface RemoveMemberFromRoomInputProps {
  roomId: string;
  userId: string;
}

export class RemoveMemberFromRoomUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    myId: string,
    input: RemoveMemberFromRoomInputProps,
  ): Promise<RoomProps> {
    const room = await this.roomRepository.findById(input.roomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const roomEntity = RoomEntity.restore(room);
    roomEntity.removeMember(myId, input.userId);

    return await this.roomRepository.save(roomEntity);
  }
}
