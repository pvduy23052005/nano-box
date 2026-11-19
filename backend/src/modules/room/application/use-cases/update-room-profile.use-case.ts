import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export interface UpdateRoomProfileInputProps {
  roomId: string;
  title: string;
  avatar?: string | null;
}

export class UpdateRoomProfileUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    myId: string,
    input: UpdateRoomProfileInputProps,
  ): Promise<RoomProps> {
    const room = await this.roomRepository.findById(input.roomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const roomEntity = RoomEntity.restore(room);
    roomEntity.updateGroupProfile(myId, input.title, input.avatar);

    return await this.roomRepository.save(roomEntity);
  }
}
