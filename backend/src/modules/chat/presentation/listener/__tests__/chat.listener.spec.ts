import { ChatListener } from '../chat.listener';
import { SendSystemMessageUseCase } from '../../application/use-cases/send-system-message.use-case';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { CHAT_SOCKET_EVENTS } from '../../gateway/event.type';
import { RoomMemberAddedEventPayload } from 'src/modules/notification/presentation/listener/notification.event';

describe('ChatListener', () => {
  let listener: ChatListener;
  let sendSystemMessageUseCase: jest.Mocked<SendSystemMessageUseCase>;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;
  let websocketService: { server: { to: jest.Mock } };
  let emitMock: jest.Mock;

  const mockPayload: RoomMemberAddedEventPayload = {
    roomId: 'room-123',
    roomTitle: 'Nhóm Thảo Luận',
    adderId: 'adder-1',
    adderName: 'Admin Duy',
    addedUserId: 'user-2',
    addedUserName: 'Thành viên B',
    memberIds: ['adder-1', 'user-2', 'user-3'],
  };

  beforeEach(() => {
    sendSystemMessageUseCase = {
      execute: jest.fn(),
    } as any;

    userRepository = {
      findById: jest.fn(),
    } as any;

    emitMock = jest.fn();
    websocketService = {
      server: {
        to: jest.fn().mockReturnValue({ emit: emitMock }),
      },
    };

    listener = new ChatListener(
      sendSystemMessageUseCase,
      userRepository,
      websocketService as unknown as WebsocketService,
    );
  });

  it('nên tạo tin nhắn hệ thống với tên từ payload và phát socket tới toàn bộ thành viên', async () => {
    const mockMessage = {
      id: 'msg-999',
      roomId: 'room-123',
      content: 'Admin Duy đã thêm Thành viên B vào nhóm',
      senderId: 'system',
      senderName: 'Hệ thống',
    } as any;

    sendSystemMessageUseCase.execute.mockResolvedValue({
      message: mockMessage,
      memberIds: ['adder-1', 'user-2', 'user-3'],
    });

    await listener.handleRoomMemberAdded(mockPayload);

    expect(sendSystemMessageUseCase.execute).toHaveBeenCalledWith({
      roomId: 'room-123',
      content: 'Admin Duy đã thêm Thành viên B vào nhóm',
      senderName: 'Hệ thống',
    });

    expect(websocketService.server.to).toHaveBeenCalledWith([
      'adder-1',
      'user-2',
      'user-3',
      'room-123',
    ]);
    expect(emitMock).toHaveBeenCalledWith(
      CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE,
      mockMessage,
    );
  });

  it('nên tự động fetch tên từ userRepository nếu payload thiếu adderName hoặc addedUserName', async () => {
    userRepository.findById
      .mockResolvedValueOnce({ getName: () => 'Admin Tự Động' } as any)
      .mockResolvedValueOnce({ getName: () => 'Member Mới' } as any);

    sendSystemMessageUseCase.execute.mockResolvedValue({
      message: { id: 'msg-1' } as any,
      memberIds: ['adder-1', 'user-2'],
    });

    await listener.handleRoomMemberAdded({
      ...mockPayload,
      adderName: undefined,
      addedUserName: undefined,
    });

    expect(userRepository.findById).toHaveBeenCalledWith('adder-1');
    expect(userRepository.findById).toHaveBeenCalledWith('user-2');
    expect(sendSystemMessageUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Admin Tự Động đã thêm Member Mới vào nhóm',
      }),
    );
  });

  it('nên dùng fallback hợp lý nếu không tìm thấy thông tin user trong db', async () => {
    userRepository.findById.mockResolvedValue(null);

    sendSystemMessageUseCase.execute.mockResolvedValue({
      message: { id: 'msg-1' } as any,
      memberIds: ['adder-1', 'user-2'],
    });

    await listener.handleRoomMemberAdded({
      ...mockPayload,
      adderName: undefined,
      addedUserName: undefined,
    });

    expect(sendSystemMessageUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Quản trị viên đã thêm thành viên vào nhóm',
      }),
    );
  });

  it('nên bỏ qua nếu thiếu roomId hoặc adderId hoặc addedUserId', async () => {
    await listener.handleRoomMemberAdded({
      ...mockPayload,
      roomId: '',
    });

    expect(sendSystemMessageUseCase.execute).not.toHaveBeenCalled();
  });
});
