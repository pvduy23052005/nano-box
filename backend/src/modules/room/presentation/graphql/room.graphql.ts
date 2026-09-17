import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoomOutput, RoomMemberOutput } from '../dto/room.output';
import { CreateSingleRoomUseCase } from '../../application/use-cases/create-single-room';
import { GetRoomsByStatusUseCase } from '../../application/use-cases/get-rooms-by-status';
import { UpdateMemberLastReadMessageUseCase } from '../../application/use-cases/update-member-last-read-message';
import { GetMeUseCase } from '../../../../modules/user/applications/use-case/get-me.use-case';
import { UserProfilePayload } from '../../../../modules/user/presentation/dto/profile.payload';
import { MemberStatus } from '../../domain/chat.enum';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { ROOM_SOCKET_EVENTS } from '../gateway/event.type';
import { RoomMapper } from '../../infrastructure/room.mapper';

@Resolver()
@UseGuards(AuthGuard)
export class RoomResolver {
  constructor(
    private readonly createSingleRoomUseCase: CreateSingleRoomUseCase,
    private readonly getRoomsByStatusUseCase: GetRoomsByStatusUseCase,
    private readonly updateMemberLastReadMessageUseCase: UpdateMemberLastReadMessageUseCase,
    private readonly websocketService: WebsocketService,
    private readonly getMeUseCase: GetMeUseCase,
  ) { }

  @Query(() => [RoomOutput])
  async getRoomsByStatus(
    @CurrentUser('id') myId: string,
    @Args('status', { type: () => MemberStatus }) status: MemberStatus,
  ) {
    const rooms = await this.getRoomsByStatusUseCase.execute(myId, status);

    return rooms.map((result) => RoomMapper.toOutput(result));
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

    let senderName = result.title;
    let senderAvatar = result.avatar;
    try {
      const sender = await this.getMeUseCase.execute(myId);
      if (sender) {
        senderName = sender.name;
        senderAvatar = sender.avatar;
      }
    } catch {
      // fallback to result values
    }

    const roomData = RoomMapper.toOutput(result, {
      title: senderName,
      avatar: senderAvatar,
    });

    this.websocketService.server
      ?.to(otherUserId)
      ?.emit(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, roomData);

    return RoomMapper.toOutput(result);
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
        ?.to([...memberIds, roomId])
        ?.emit(ROOM_SOCKET_EVENTS.USER_READ_MESSAGE, {
          roomId,
          userId: myId,
          messageId,
        });
    }

    return isSuccess;
  }
}

@Resolver(() => RoomMemberOutput)
export class RoomMemberResolver {
  constructor(private readonly getMeUseCase: GetMeUseCase) { }

  @ResolveField(() => UserProfilePayload, { name: 'user', nullable: true })
  async getUser(@Parent() member: RoomMemberOutput) {
    try {
      return await this.getMeUseCase.execute(member.userId);
    } catch {
      return null;
    }
  }
}
