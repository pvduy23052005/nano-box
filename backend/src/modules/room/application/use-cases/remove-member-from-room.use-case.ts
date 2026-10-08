import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { RoomEntity } from '../../domain/room.entity';
import { RoomMemberProps, RoomProps } from '../../domain/room.type';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export interface RemoveMemberFromRoomInputProps {
  roomId: string;
  userId: string;
}

export interface RemoveMemberFromRoomOutputProps extends RoomProps {
  removedMember?: RoomMemberProps;
}

export class RemoveMemberFromRoomUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    myId: string,
    input: RemoveMemberFromRoomInputProps,
  ): Promise<RemoveMemberFromRoomOutputProps> {
    const room = await this.roomRepository.findById(input.roomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const removedMember = (room.members || []).find(
      (member) => member.userId === input.userId,
    );

    const roomEntity = RoomEntity.restore(room);
    roomEntity.removeMember(myId, input.userId);

    const savedRoom = await this.roomRepository.save(roomEntity);

    return {
      ...savedRoom,
      removedMember,
    };
  }
}
