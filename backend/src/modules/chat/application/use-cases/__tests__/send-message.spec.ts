import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MemberRole, MemberStatus } from '../../../../room/domain/chat.enum';
import { RoomRepositoryAdapter } from '../../../../room/application/ports/room.ports';
import { UploadAdapter } from '../../../../upload/applications/ports/upload.port';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { SendMessageUseCase } from '../send-message.use-case';

describe('SendMessageUseCase', () => {
  let sendMessageUseCase: SendMessageUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;
  let uploadAdapter: jest.Mocked<UploadAdapter>;

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    roomRepository = {
      save: jest.fn(),
      findRoomsByUserIdAndStatus: jest.fn(),
      checkRoomExist: jest.fn(),
      findById: jest.fn(),
      updateLastMessageId: jest.fn(),
      updateMemberLastReadMessage: jest.fn(),
      acceptAllMembers: jest.fn(),
      deleteRoom: jest.fn(),
      findRoomMembers: jest.fn(),
      findRoomMembersWithProfile: jest.fn(),
      findRelatedUserIdsByRooms: jest.fn(),
    };

    uploadAdapter = {
      upload: jest.fn(),
      copyTempToUploads: jest.fn(),
      deleteTempFile: jest.fn(),
      validateTempKey: jest.fn(),
    };

    sendMessageUseCase = new SendMessageUseCase(
      messageRepository,
      roomRepository,
      uploadAdapter,
    );
  });

  it('should throw DomainValidationException if room does not exist', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue(null);

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if sender is not a member of the room', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-2',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: 'user-3',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should save message and return SendMessageOutputDto with memberIds', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
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
    });

    const mockSavedMessage = {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello world',
      attachments: [],
      readBy: [],
    };

    messageRepository.save.mockResolvedValue(mockSavedMessage);

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello world',
    });

    expect(roomRepository.findRoomMembersWithProfile).toHaveBeenCalledWith(
      'room-1',
    );
    expect(result).toEqual({
      message: mockSavedMessage,
      memberIds: ['user-1', 'user-2'],
    });
    expect(messageRepository.save).toHaveBeenCalledTimes(1);
    expect(roomRepository.updateLastMessageId).toHaveBeenCalledWith(
      'room-1',
      'msg-1',
    );
  });

  it('should take senderAvatar and senderName from room member', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
          name: 'User One',
          avatar: 'https://example.com/avatar.jpg',
        },
      ],
    });

    const mockSavedMessage = {
      id: 'msg-2',
      roomId: 'room-1',
      senderId: 'user-1',
      senderAvatar: 'https://example.com/avatar.jpg',
      senderName: 'User One',
      content: 'Hello with avatar',
      attachments: [],
      readBy: [],
    };

    messageRepository.save.mockResolvedValue(mockSavedMessage);

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      senderAvatar: 'https://spoofed.com/fake.jpg',
      senderName: 'Fake Name',
      content: 'Hello with avatar',
    });

    expect(result.message.senderAvatar).toBe('https://example.com/avatar.jpg');
    expect(result.message.senderName).toBe('User One');
  });

  it('should copy tempKeys to uploads and delete temp files after save', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    uploadAdapter.copyTempToUploads.mockResolvedValue(
      'https://cdn.example.com/uploads/photo.jpg',
    );
    messageRepository.save.mockResolvedValue({
      id: 'msg-with-temp',
      content: 'Check this image',
      roomId: 'room-1',
      senderId: 'user-1',
      attachments: ['https://cdn.example.com/uploads/photo.jpg'],
    });

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Check this image',
      tempKeys: ['temp/photo.jpg'],
    });

    expect(uploadAdapter.copyTempToUploads).toHaveBeenCalledWith(
      'temp/photo.jpg',
    );
    expect(result.message.id).toBe('msg-with-temp');
    expect(uploadAdapter.deleteTempFile).toHaveBeenCalledWith('temp/photo.jpg');
  });

  it('should throw DomainValidationException if tempKeys exceeds maximum limit', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    const tooManyKeys = Array.from(
      { length: 11 },
      (_, i) => `temp/img-${i}.jpg`,
    );

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Too many files',
        tempKeys: tooManyKeys,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if combined attachments and tempKeys exceed limit', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    const existingAttachments = Array.from(
      { length: 6 },
      (_, i) => `https://cdn.example.com/uploads/old-${i}.jpg`,
    );
    const tempKeys = Array.from({ length: 5 }, (_, i) => `temp/new-${i}.jpg`);

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Too many combined files',
        attachments: existingAttachments,
        tempKeys,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if copyTempToUploads fails or times out', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    uploadAdapter.copyTempToUploads.mockRejectedValue(
      new Error('Quá thời gian sao chép file trên Cloudflare R2'),
    );

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Image with error',
        tempKeys: ['temp/photo.jpg'],
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if sender status is REFUSED', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          role: MemberRole.MEMBER,
          status: MemberStatus.REFUSED,
        },
      ],
    });

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello from refused member',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should allow sending message when sender status is WAITTING without changing room status', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
        {
          userId: 'user-2',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    messageRepository.save.mockResolvedValue({
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Replying to message request',
      attachments: [],
      reactions: [],
      readBy: [],
      isSystem: false,
    });

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Replying to message request',
    });

    expect(roomRepository.acceptAllMembers).not.toHaveBeenCalled();
    expect(result.memberIds).toEqual(['user-1', 'user-2']);
  });

  it('should filter out REFUSED members from returned memberIds', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          name: 'User One',
          avatar: null,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: 'user-2',
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
        {
          userId: 'user-3',
          role: MemberRole.MEMBER,
          status: MemberStatus.REFUSED,
        },
      ],
    });

    messageRepository.save.mockResolvedValue({
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello everyone',
      attachments: [],
      reactions: [],
      readBy: [],
      isSystem: false,
    });

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello everyone',
    });

    expect(result.memberIds).toEqual(['user-1', 'user-2']);
    expect(result.memberIds).not.toContain('user-3');
  });

  it('should filter mentionedUserIds: keep valid members, remove senderId, remove duplicates and non-members', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
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
        {
          userId: 'user-3',
          role: MemberRole.MEMBER,
          status: MemberStatus.REFUSED,
        },
      ],
    });

    messageRepository.save.mockImplementation(async (entity) => ({
      id: 'msg-1',
      roomId: entity.getRoomId(),
      senderId: entity.getSenderId(),
      content: entity.getContent(),
      attachments: entity.getAttachments(),
      reactions: entity.getReactions(),
      readBy: entity.getReadBy(),
      mentionedUserIds: entity.getMentionedUserIds(),
      isSystem: entity.getIsSystem(),
    }));

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hey @user-2 @user-1 @non-member @user-2',
      mentionedUserIds: ['user-2', 'user-1', 'non-member', 'user-2', 'user-3'],
    });

    expect(result.message.mentionedUserIds).toEqual(['user-2']);
  });
});
