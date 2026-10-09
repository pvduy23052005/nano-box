import { RoomRepositoryAdapter } from '../ports/room.ports';
import { FriendshipRepositoryAdapter } from 'src/modules/friendship/applications/ports/friendship.port';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export interface AddMemberToRoomInputProps {
  roomId: string;
  userId: string;
}

export class AddMemberToRoomUseCase {
  constructor(
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  async execute(
    myId: string,
    input: AddMemberToRoomInputProps,
  ): Promise<RoomProps> {
    const room = await this.roomRepository.findById(input.roomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const roomEntity = RoomEntity.restore(room);
    roomEntity.addMember(myId, input.userId);

    const areFriends = await this.friendshipRepository.checkAllAreFriends(
      myId,
      [input.userId],
    );

    if (!areFriends) {
      throw new DomainValidationException(
        'userId',
        'Chỉ có thể thêm bạn bè vào nhóm',
      );
    }

    return await this.roomRepository.save(roomEntity);
  }
}
