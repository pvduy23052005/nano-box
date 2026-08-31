import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateRoomNotFriendOutput } from '../dto/create.output';
import { CreateSingleRoomUseCase } from '../../application/use-cases/create-single-room';

@Resolver()
@UseGuards(AuthGuard)
export class RoomResolver {
  constructor(
    private readonly createSingleRoomUseCase: CreateSingleRoomUseCase,
  ) { }

  @Mutation(() => CreateRoomNotFriendOutput)
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
