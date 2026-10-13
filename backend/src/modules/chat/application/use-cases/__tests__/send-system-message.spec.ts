import { SendSystemMessageUseCase } from '../send-system-message.use-case';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import {
  RoomMembersResult,
  RoomRepositoryAdapter,
} from '../../../../room/application/ports/room.ports';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageEntity } from '../../../domain/message.entity';
import { MemberRole, MemberStatus } from '../../../../room/domain/chat.enum';

describe('SendSystemMessageUseCase', () => {
  let useCase: SendSystemMessageUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const roomId = '65f1234567890abcdef12345';
  const mockRoom: RoomMembersResult = {
    roomId,
    members: [
      {
        userId: 'user-1',
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
      },
      {
        userId: 'user-2',
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
      },
    ],
  };

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    roomRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateLastMessageId: jest.fn(),
      findRoomsByUserIdAndStatus: jest.fn(),
      checkRoomExist: jest.fn(),
      updateMemberLastReadMessage: jest.fn(),
      acceptAllMembers: jest.fn(),
      deleteRoom: jest.fn(),
      findRoomMembers: jest.fn(),
      findRelatedUserIdsByRooms: jest.fn(),
    };
    useCase = new SendSystemMessageUseCase(messageRepository, roomRepository);
  });

  it('nên tạo và lưu tin nhắn hệ thống thành công, cập nhật lastMessageId của room', async () => {
    roomRepository.findRoomMembers.mockResolvedValue(mockRoom);
    messageRepository.save.mockResolvedValue({
      id: 'msg-123',
      roomId,
      content: 'Admin đã thêm Thành viên A vào nhóm',
      senderId: 'system',
      senderName: 'Hệ thống',
      attachments: [],
      reactions: [],
      readBy: [],
    });

    const result = await useCase.execute({
      roomId,
      content: 'Admin đã thêm Thành viên A vào nhóm',
    });

    expect(roomRepository.findRoomMembers).toHaveBeenCalledWith(roomId, false);
    expect(messageRepository.save).toHaveBeenCalledWith(
      expect.any(MessageEntity),
    );
    expect(roomRepository.updateLastMessageId).toHaveBeenCalledWith(
      roomId,
      'msg-123',
    );
    expect(result.message.id).toBe('msg-123');
    expect(result.message.senderId).toBe('system');
    expect(result.memberIds).toEqual(['user-1', 'user-2']);
  });

  it('nên ném DomainValidationException nếu phòng không tồn tại', async () => {
    roomRepository.findRoomMembers.mockResolvedValue(null);

    await expect(
      useCase.execute({
        roomId,
        content: 'Nội dung test',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu nội dung tin nhắn rỗng', async () => {
    roomRepository.findRoomMembers.mockResolvedValue(mockRoom);

    await expect(
      useCase.execute({
        roomId,
        content: '   ',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên bỏ qua truy vấn findRoomMembers khi memberIds đã được truyền trong input', async () => {
    messageRepository.save.mockResolvedValue({
      id: 'msg-456',
      roomId,
      content: 'Tin nhắn hệ thống với memberIds có sẵn',
      senderId: 'system',
      senderName: 'Hệ thống',
      attachments: [],
      reactions: [],
      readBy: [],
    });

    const result = await useCase.execute({
      roomId,
      content: 'Tin nhắn hệ thống với memberIds có sẵn',
      memberIds: ['user-1', 'user-2', 'user-3'],
    });

    expect(roomRepository.findRoomMembers).not.toHaveBeenCalled();
    expect(messageRepository.save).toHaveBeenCalled();
    expect(roomRepository.updateLastMessageId).toHaveBeenCalledWith(
      roomId,
      'msg-456',
    );
    expect(result.memberIds).toEqual(['user-1', 'user-2', 'user-3']);
  });
});
