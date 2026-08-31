import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';

export abstract class RoomRepositoryAdapter {
  abstract save(room: RoomEntity): Promise<RoomProps>;
}
