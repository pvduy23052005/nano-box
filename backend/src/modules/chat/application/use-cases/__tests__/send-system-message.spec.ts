import { SendSystemMessageUseCase } from '../send-system-message.use-case';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageEntity } from '../../../domain/message.entity';

describe('SendSystemMessageUseCase', () => {
  let useCase: SendSystemMessageUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const roomId = '65f1234567890abcdef12345';
  const mockRoom = {
    id: roomId,
    title: 'Nhóm Test',
    typeRoom: 2,
    lastMessageId: null,
    avatar: null,
    members: [{ userId: 'user-1' }, { userId: 'user-2' }],
  } as any;

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
    };
    useCase = new SendSystemMessageUseCase(messageRepository, roomRepository);
  });

  it('nên tạo và lưu tin nhắn hệ thống thành công, cập nhật lastMessageId của room', async () => {
    roomRepository.findById.mockResolvedValue(mockRoom);
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

    expect(roomRepository.findById).toHaveBeenCalledWith(roomId);
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
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        roomId,
        content: 'Nội dung test',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu nội dung tin nhắn rỗng', async () => {
    roomRepository.findById.mockResolvedValue(mockRoom);

    await expect(
      useCase.execute({
        roomId,
        content: '   ',
      }),
    ).rejects.toThrow(DomainValidationException);
  });
});
