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
import {
  RoomOutput,
  RoomMemberOutput,
} from '../dto/room.output';
import { CreateSingleRoomUseCase } from '../../application/use-cases/create-single-room';
import { GetRoomsByStatusUseCase } from '../../application/use-cases/get-rooms-by-status';
import { GetMeUseCase } from '../../../../modules/user/applications/use-case/get-me.use-case';
import { UserProfilePayload } from '../../../../modules/user/presentation/dto/profile.payload';
import { MemberStatus } from '../../domain/chat.enum';

@Resolver()
@UseGuards(AuthGuard)
export class RoomResolver {
  constructor(
    private readonly createSingleRoomUseCase: CreateSingleRoomUseCase,
    private readonly getRoomsByStatusUseCase: GetRoomsByStatusUseCase,
  ) {}

  @Query(() => [RoomOutput])
  async getRoomsByStatus(
    @CurrentUser('id') myId: string,
    @Args('status', { type: () => MemberStatus }) status: MemberStatus,
  ) {
    const rooms = await this.getRoomsByStatusUseCase.execute(
      myId,
      status,
    );

    return rooms.map((result) => ({
      id: result.id,
      title: result.title,
      typeRoom: result.typeRoom,
      lastMessageId: result.lastMessageId,
      members: result.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        status: member.status,
      })),
      avatar: result.avatar,
    }));
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

    return {
      id: result.id,
      title: result.title,
      typeRoom: result.typeRoom,
      lastMessageId: result.lastMessageId,
      members: result.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        status: member.status,
      })),
      avatar: result.avatar,
    };
  }
}

@Resolver(() => RoomMemberOutput)
export class RoomMemberResolver {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @ResolveField(() => UserProfilePayload, { name: 'user', nullable: true })
  async getUser(@Parent() member: RoomMemberOutput) {
    try {
      return await this.getMeUseCase.execute(member.userId);
    } catch {
      return null;
    }
  }
}
