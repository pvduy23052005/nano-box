import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { MemberStatus } from '../../domain/chat.enum';

export class EnsureFriendRoomUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(user1Id: string, user2Id: string): Promise<RoomProps> {
    const existingRoom = await this.roomRepository.checkRoomExist(
      user1Id,
      user2Id,
    );

    if (existingRoom) {
      const hasUnacceptedMember = existingRoom.members.some(
        (member) => member.status !== MemberStatus.ACCEPTED,
      );

      if (hasUnacceptedMember) {
        const updated = await this.roomRepository.acceptAllMembers(
          existingRoom.id,
        );
        return updated ?? existingRoom;
      }

      return existingRoom;
    }

    const room = RoomEntity.createFriendRoom(user1Id, user2Id);
    return await this.roomRepository.save(room);
  }
}
