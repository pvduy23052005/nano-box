import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { RoomEntity } from '../../domain/room.entity';
import { RoomMemberProps, RoomProps } from '../../domain/room.type';
import { RoomRepositoryAdapter } from '../ports/room.ports';

export interface LeaveRoomInputProps {
  roomId: string;
}

export interface LeaveRoomOutputProps {
  success: boolean;
  isRoomEmpty: boolean;
  room?: RoomProps;
  leavingMember?: RoomMemberProps;
  newSuperAdminId?: string;
}

export class LeaveRoomUseCase {
  constructor(private readonly roomRepository: RoomRepositoryAdapter) {}

  async execute(
    myId: string,
    input: LeaveRoomInputProps,
  ): Promise<LeaveRoomOutputProps> {
    const cleanRoomId = input?.roomId?.trim();
    if (!cleanRoomId) {
      throw new DomainValidationException('roomId', 'ID phòng không hợp lệ');
    }

    const room = await this.roomRepository.findById(cleanRoomId, myId);

    if (!room) {
      throw new DomainValidationException(
        'roomId',
        'Không tìm thấy phòng trò chuyện',
      );
    }

    const leavingMember = (room.members || []).find(
      (member) => member.userId === myId,
    );

    const roomEntity = RoomEntity.restore(room);
    const { newSuperAdminId, isRoomEmpty } = roomEntity.leaveRoom(myId);

    if (isRoomEmpty) {
      await this.roomRepository.deleteRoom(input.roomId);
      return {
        success: true,
        isRoomEmpty: true,
        leavingMember,
      };
    }

    const savedRoom = await this.roomRepository.save(roomEntity);

    return {
      success: true,
      isRoomEmpty: false,
      room: savedRoom,
      leavingMember,
      newSuperAdminId,
    };
  }
}
