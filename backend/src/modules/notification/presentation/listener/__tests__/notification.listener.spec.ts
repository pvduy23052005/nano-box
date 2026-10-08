import { NotificationListener } from '../notification.listener';
import { CreateNotificationUseCase } from '../../applications/use-cases/create-notification.use-case';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { NotificationType } from '../../../domain/notification.type';
import { NOTIFICATION_SOCKET_EVENTS } from '../notification.event';

describe('NotificationListener', () => {
  let listener: NotificationListener;
  let createNotificationUseCase: jest.Mocked<CreateNotificationUseCase>;
  let websocketService: { server: { to: jest.Mock } };
  let userRepository: jest.Mocked<UserRepositoryAdapter>;
  let emitMock: jest.Mock;

  beforeEach(() => {
    createNotificationUseCase = {
      execute: jest.fn(),
    } as any;

    emitMock = jest.fn();
    websocketService = {
      server: {
        to: jest.fn().mockReturnValue({ emit: emitMock }),
      },
    };

    userRepository = {
      findById: jest.fn(),
    } as any;

    listener = new NotificationListener(
      createNotificationUseCase,
      websocketService as unknown as WebsocketService,
      userRepository,
    );
  });

  describe('handleRoomMemberAdded', () => {
    const payload = {
      roomId: 'room-1',
      roomTitle: 'Nhóm Lập Trình',
      adderId: 'admin-1',
      adderName: 'Admin Duy',
      adderAvatar: 'http://avatar.com/admin.png',
      addedUserId: 'member-2',
      memberIds: ['admin-1', 'member-2'],
    };

    it('nên tạo thông báo NEW_ROOM cho thành viên được thêm và bắn socket', async () => {
      const mockNotification = { id: 'notif-1', ...payload } as any;
      createNotificationUseCase.execute.mockResolvedValue(mockNotification);

      await listener.handleRoomMemberAdded(payload);

      expect(createNotificationUseCase.execute).toHaveBeenCalledWith({
        recipientId: 'member-2',
        senderId: 'admin-1',
        senderName: 'Admin Duy',
        senderAvatar: 'http://avatar.com/admin.png',
        type: NotificationType.NEW_ROOM,
        title: 'Nhóm Lập Trình',
        content: 'Admin Duy đã thêm bạn vào nhóm "Nhóm Lập Trình".',
        metadata: {
          roomId: 'room-1',
        },
      });

      expect(websocketService.server.to).toHaveBeenCalledWith('member-2');
      expect(emitMock).toHaveBeenCalledWith(
        NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
        mockNotification,
      );
    });

    it('nên tự động fetch thông tin adder từ userRepository nếu payload thiếu senderName', async () => {
      userRepository.findById.mockResolvedValue({
        getName: () => 'Admin DB',
        getAvatar: () => 'http://avatar.com/db.png',
      } as any);

      await listener.handleRoomMemberAdded({
        ...payload,
        adderName: undefined,
        adderAvatar: undefined,
      });

      expect(userRepository.findById).toHaveBeenCalledWith('admin-1');
      expect(createNotificationUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          senderName: 'Admin DB',
          senderAvatar: 'http://avatar.com/db.png',
          content: 'Admin DB đã thêm bạn vào nhóm "Nhóm Lập Trình".',
        }),
      );
    });

    it('nên bỏ qua nếu thiếu roomId hoặc adderId hoặc addedUserId', async () => {
      await listener.handleRoomMemberAdded({
        ...payload,
        roomId: '',
      });

      expect(createNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
