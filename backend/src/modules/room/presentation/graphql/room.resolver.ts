import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  NOTIFICATION_EVENTS,
  type RoomCreatedEventPayload,
} from 'src/modules/notification/presentation/listener/notification.event';
import { ROOM_EVENTS } from '../event/room.event';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoomOutput } from '../dto/room.output';
import { CreateSingleRoomUseCase } from '../../application/use-cases/create-single-room';
import { GetRoomsByStatusUseCase } from '../../application/use-cases/get-rooms-by-status';
import { GetRoomDetailUseCase } from '../../application/use-cases/get-room-detail.use-case';
import { UpdateMemberLastReadMessageUseCase } from '../../application/use-cases/update-member-last-read-message';
import { MemberStatus } from '../../domain/chat.enum';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { ROOM_SOCKET_EVENTS } from '../gateway/event.type';
import { RoomMapper } from '../../infrastructure/room.mapper';
import { CreateGroupRoomUseCase } from '../../application/use-cases/create-group-room';
import { UpdateRoomProfileUseCase } from '../../application/use-cases/update-room-profile.use-case';
import { AddMemberToRoomUseCase } from '../../application/use-cases/add-member-to-room.use-case';
import { RemoveMemberFromRoomUseCase } from '../../application/use-cases/remove-member-from-room.use-case';
import { AssignRoomAdminUseCase } from '../../application/use-cases/assign-room-admin.use-case';
import { RevokeRoomAdminUseCase } from '../../application/use-cases/revoke-room-admin.use-case';
import { LeaveRoomUseCase } from '../../application/use-cases/leave-room.use-case';
import { CreateGroupRoomInput } from '../dto/create.input';
import { UpdateRoomProfileInput } from '../dto/update.input';
import { AddMemberToRoomInput } from '../dto/add-member.input';
import { RemoveMemberFromRoomInput } from '../dto/remove-member.input';
import { AssignRoomAdminInput } from '../dto/assign-room-admin.input';
import { RevokeRoomAdminInput } from '../dto/revoke-room-admin.input';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Resolver()
@UseGuards(AuthGuard)
export class RoomResolver {
  constructor(
    private readonly createSingleRoomUseCase: CreateSingleRoomUseCase,
    private readonly createGroupRoomUseCase: CreateGroupRoomUseCase,
    private readonly updateRoomProfileUseCase: UpdateRoomProfileUseCase,
    private readonly addMemberToRoomUseCase: AddMemberToRoomUseCase,
    private readonly removeMemberFromRoomUseCase: RemoveMemberFromRoomUseCase,
    private readonly assignRoomAdminUseCase: AssignRoomAdminUseCase,
    private readonly revokeRoomAdminUseCase: RevokeRoomAdminUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase,
    private readonly getRoomsByStatusUseCase: GetRoomsByStatusUseCase,
    private readonly getRoomDetailUseCase: GetRoomDetailUseCase,
    private readonly updateMemberLastReadMessageUseCase: UpdateMemberLastReadMessageUseCase,
    private readonly websocketService: WebsocketService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Query(() => [RoomOutput])
  async getRoomsByStatus(
    @CurrentUser('id') myId: string,
    @Args('status', { type: () => MemberStatus }) status: MemberStatus,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    const rooms = await this.getRoomsByStatusUseCase.execute(
      myId,
      status,
      search,
    );

    return rooms.map((result) => RoomMapper.toOutput(result));
  }

  @Query(() => RoomOutput)
  async getRoomDetail(
    @CurrentUser('id') myId: string,
    @Args('roomId') roomId: string,
  ): Promise<RoomOutput> {
    const room = await this.getRoomDetailUseCase.execute(roomId, myId);
    return RoomMapper.toOutput(room);
  }

  @Mutation(() => RoomOutput)
  async createRoomChatNotFriend(
    @CurrentUser('id') myId: string,
    @Args('otherUserId') otherUserId: string,
  ) {
    const result = await this.createSingleRoomUseCase.execute(
      myId,
      otherUserId,
    );

    const meMember = result.members?.find((member) => member.userId === myId);
    const senderName = meMember?.name ?? result.title;
    const senderAvatar = meMember?.avatar ?? result.avatar;

    const roomData = RoomMapper.toOutput(result, {
      title: senderName,
      avatar: senderAvatar,
    });

    this.websocketService.server
      ?.to(otherUserId)
      ?.emit(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, roomData);

    return RoomMapper.toOutput(result);
  }

  @Mutation(() => RoomOutput)
  async createGroupRoom(
    @CurrentUser('id') myId: string,
    @Args('input') input: CreateGroupRoomInput,
  ): Promise<RoomOutput> {
    const result = await this.createGroupRoomUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    const recipientIds = result.members
      .map((member) => member.userId)
      .filter((userId) => userId && userId !== myId);

    if (recipientIds.length > 0) {
      this.websocketService.server
        ?.to(recipientIds)
        ?.emit(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, roomOutput);
    }

    const meMember = result.members?.find((member) => member.userId === myId);
    const creatorName = meMember?.name ?? undefined;
    const creatorAvatar = meMember?.avatar ?? undefined;

    const payload: RoomCreatedEventPayload = {
      roomId: result.id,
      roomTitle: result.title || input.title,
      creatorId: myId,
      creatorName,
      creatorAvatar,
      memberIds: recipientIds,
    };
    this.eventEmitter.emit(NOTIFICATION_EVENTS.ROOM_CREATED, payload);

    return roomOutput;
  }

  @Mutation(() => Boolean)
  async updateMemberLastReadMessage(
    @CurrentUser('id') myId: string,
    @Args('roomId') roomId: string,
    @Args('messageId') messageId: string,
  ): Promise<boolean> {
    const { isSuccess, memberIds } =
      await this.updateMemberLastReadMessageUseCase.execute(
        roomId,
        myId,
        messageId,
      );

    if (isSuccess && memberIds.length > 0) {
      this.websocketService.server
        ?.to(memberIds)
        ?.emit(ROOM_SOCKET_EVENTS.USER_READ_MESSAGE, {
          roomId,
          userId: myId,
          messageId,
        });
    }

    return isSuccess;
  }

  @Mutation(() => RoomOutput)
  async updateRoomProfile(
    @CurrentUser('id') myId: string,
    @Args('input') input: UpdateRoomProfileInput,
  ): Promise<RoomOutput> {
    const result = await this.updateRoomProfileUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    const recipientIds = (result.members || [])
      .map((member) => member.userId)
      .filter(Boolean);

    if (recipientIds.length > 0) {
      this.websocketService.server
        ?.to(recipientIds)
        ?.emit(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, roomOutput);
      this.websocketService.server
        ?.to(recipientIds)
        ?.emit(ROOM_SOCKET_EVENTS.ROOM_UPDATED, roomOutput);
    }

    return roomOutput;
  }

  @Mutation(() => RoomOutput)
  async addMemberToRoom(
    @CurrentUser('id') myId: string,
    @Args('input') input: AddMemberToRoomInput,
  ): Promise<RoomOutput> {
    const result = await this.addMemberToRoomUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    this.eventEmitter.emit(ROOM_EVENTS.MEMBER_ADDED, {
      room: result,
      roomOutput,
      adderId: myId,
      addedUserId: input.userId,
    });

    return roomOutput;
  }

  @Mutation(() => RoomOutput)
  async removeMemberFromRoom(
    @CurrentUser('id') myId: string,
    @Args('input') input: RemoveMemberFromRoomInput,
  ): Promise<RoomOutput> {
    const result = await this.removeMemberFromRoomUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    this.eventEmitter.emit(ROOM_EVENTS.MEMBER_REMOVED, {
      room: result,
      roomOutput,
      actorId: myId,
      removedUserId: input.userId,
      removedMember: result.removedMember,
    });

    return roomOutput;
  }

  @Mutation(() => RoomOutput)
  async assignRoomAdmin(
    @CurrentUser('id') myId: string,
    @Args('input') input: AssignRoomAdminInput,
  ): Promise<RoomOutput> {
    const result = await this.assignRoomAdminUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    this.eventEmitter.emit(ROOM_EVENTS.ADMIN_ASSIGNED, {
      room: result,
      roomOutput,
      actorId: myId,
      targetUserId: input.userId,
    });

    return roomOutput;
  }

  @Mutation(() => RoomOutput)
  async revokeRoomAdmin(
    @CurrentUser('id') myId: string,
    @Args('input') input: RevokeRoomAdminInput,
  ): Promise<RoomOutput> {
    const result = await this.revokeRoomAdminUseCase.execute(myId, input);
    const roomOutput = RoomMapper.toOutput(result);

    this.eventEmitter.emit(ROOM_EVENTS.ADMIN_REVOKED, {
      room: result,
      roomOutput,
      actorId: myId,
      targetUserId: input.userId,
    });

    return roomOutput;
  }

  @Mutation(() => Boolean)
  async leaveRoom(
    @CurrentUser('id') myId: string,
    @Args('roomId') roomId: string,
  ): Promise<boolean> {
    const result = await this.leaveRoomUseCase.execute(myId, { roomId });
    const roomOutput = result.room
      ? RoomMapper.toOutput(result.room)
      : undefined;

    this.eventEmitter.emit(ROOM_EVENTS.MEMBER_LEFT, {
      roomId,
      actorId: myId,
      isRoomEmpty: result.isRoomEmpty,
      room: result.room,
      roomOutput,
      leavingMember: result.leavingMember,
      newSuperAdminId: result.newSuperAdminId,
    });

    return result.success;
  }
}
