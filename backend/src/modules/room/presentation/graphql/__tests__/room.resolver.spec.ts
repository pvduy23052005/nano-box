import { RoomResolver } from '../room.resolver';
import { AddMemberToRoomUseCase } from '../../../application/use-cases/add-member-to-room.use-case';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { GetMeUseCase } from '../../../../user/applications/use-case/get-me.use-case';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENTS } from 'src/modules/notification/presentation/listener/notification.event';
import { ROOM_SOCKET_EVENTS } from '../../gateway/event.type';
import { RoomType, MemberRole, MemberStatus } from '../../../domain/chat.enum';

describe('RoomResolver', () => {
  let resolver: RoomResolver;
  let addMemberToRoomUseCase: jest.Mocked<AddMemberToRoomUseCase>;
  let websocketService: { server: { to: jest.Mock } };
  let getMeUseCase: jest.Mocked<GetMeUseCase>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let emitMock: jest.Mock;

  const myId = 'admin-user-id';
  const newMemberId = 'target-friend-id';
  const roomId = 'room-123';

  const mockRoomResult = {
    id: roomId,
    title: 'Nhóm Thảo Luận',
    typeRoom: RoomType.GROUP,
    lastMessageId: null,
    avatar: null,
    members: [
      {
        userId: myId,
        role: MemberRole.SUPER_ADMIN,
        status: MemberStatus.ACCEPTED,
        name: 'Duy Admin',
        avatar: 'http://avatar/admin.png',
      },
      {
        userId: newMemberId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
        name: 'Bạn Nam',
        avatar: 'http://avatar/nam.png',
      },
    ],
  };

  beforeEach(() => {
    addMemberToRoomUseCase = {
      execute: jest.fn(),
    } as any;

    emitMock = jest.fn();
    websocketService = {
      server: {
        to: jest.fn().mockReturnValue({ emit: emitMock }),
      },
    };

    getMeUseCase = {
      execute: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    resolver = new RoomResolver(
      {} as any,
      {} as any,
      {} as any,
      addMemberToRoomUseCase,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      websocketService as unknown as WebsocketService,
      getMeUseCase,
      eventEmitter,
    );
  });

  it('addMemberToRoom nên phát event ROOM_MEMBER_ADDED sau khi thêm thành viên thành công', async () => {
    addMemberToRoomUseCase.execute.mockResolvedValue(mockRoomResult as any);
    getMeUseCase.execute.mockResolvedValue({
      id: myId,
      name: 'Duy Admin',
      avatar: 'http://avatar/admin.png',
    } as any);

    const input = { roomId, userId: newMemberId };
    const output = await resolver.addMemberToRoom(myId, input);

    expect(addMemberToRoomUseCase.execute).toHaveBeenCalledWith(myId, input);
    expect(websocketService.server.to).toHaveBeenCalledWith([myId, newMemberId]);
    expect(emitMock).toHaveBeenCalledWith(
      ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM,
      expect.anything(),
    );
    expect(emitMock).toHaveBeenCalledWith(
      ROOM_SOCKET_EVENTS.ROOM_UPDATED,
      expect.anything(),
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      NOTIFICATION_EVENTS.ROOM_MEMBER_ADDED,
      {
        roomId,
        roomTitle: 'Nhóm Thảo Luận',
        adderId: myId,
        adderName: 'Duy Admin',
        adderAvatar: 'http://avatar/admin.png',
        addedUserId: newMemberId,
        addedUserName: 'Bạn Nam',
        memberIds: [myId, newMemberId],
      },
    );

    expect(output.id).toBe(roomId);
  });
});
