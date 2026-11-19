import { RoomRepositoryAdapter } from '../ports/room.ports';
import { FriendshipRepositoryAdapter } from 'src/modules/friendship/applications/ports/friendship.port';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export interface CreateGroupRoomInputProps {
  title: string;
  memberIds: string[];
  avatar?: string | null;
}

export class CreateGroupRoomUseCase {
  constructor(
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  async execute(
    myId: string,
    input: CreateGroupRoomInputProps,
  ): Promise<RoomProps> {
    const cleanMemberIds = Array.from(
      new Set((input.memberIds || []).filter((id) => id && id !== myId)),
    );

    const room = RoomEntity.createGroupRoom(
      myId,
      input.title,
      cleanMemberIds,
      input.avatar ?? null,
    );

    const areFriends = await this.friendshipRepository.checkAllAreFriends(
      myId,
      cleanMemberIds,
    );

    if (!areFriends) {
      throw new DomainValidationException(
        'memberIds',
        'Chỉ có thể thêm những người là bạn bè vào nhóm',
      );
    }

    return await this.roomRepository.save(room);
  }
}
