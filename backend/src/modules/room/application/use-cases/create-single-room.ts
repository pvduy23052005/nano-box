import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';

export class CreateSingleRoomUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(myId: string, userId: string): Promise<RoomProps> {
    const existingRoom = await this.roomRepository.checkRoomExist(myId, userId);
    if (existingRoom) {
      return existingRoom;
    }

    const room = RoomEntity.createSingleRoom(myId, userId);

    return await this.roomRepository.save(room);
  }
}
