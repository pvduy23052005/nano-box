import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { RoomRepositoryAdapter } from '../ports/room.ports';
import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';

export class CreateSingleRoomUseCase {
  constructor(
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly userRepository: UserRepositoryAdapter,
  ) {}

  async execute(myId: string, userId: string): Promise<RoomProps> {
    const cleanUserId = userId?.trim();
    if (!cleanUserId) {
      throw new DomainValidationException(
        'otherUserId',
        'ID người dùng không được để trống',
      );
    }

    if (myId === cleanUserId) {
      throw new DomainValidationException(
        'otherUserId',
        'Không thể tạo cuộc trò chuyện với chính mình',
      );
    }

    const targetUser = await this.userRepository.findById(cleanUserId);
    if (!targetUser) {
      throw new DomainValidationException(
        'otherUserId',
        'Người dùng không tồn tại',
      );
    }

    const existingRoom = await this.roomRepository.checkRoomExist(
      myId,
      cleanUserId,
    );
    if (existingRoom) {
      return existingRoom;
    }

    const room = RoomEntity.createSingleRoom(myId, cleanUserId);

    return await this.roomRepository.save(room);
  }
}
