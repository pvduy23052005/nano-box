import {
  SendFriendRequestPayload,
  GetReceivedFriendRequestPayload,
} from '../dto/friendship.payload';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendshipStatus } from '../../domain/friendship.type';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { SendFriendRequestUseCase } from '../../applications/use-case/send-friend-request.use-case';
import { GetReceivedFriendRequestsUseCase } from '../../applications/use-case/get-received-friend-requests.use-case';

@Resolver()
@UseGuards(AuthGuard)
export class FriendshipResolver {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly getReceivedFriendRequestsUseCase: GetReceivedFriendRequestsUseCase,
  ) {}

  @Query(() => [GetReceivedFriendRequestPayload])
  async getReceivedFriendRequests(
    @CurrentUser('id') userId: string,
  ): Promise<GetReceivedFriendRequestPayload[]> {
    const result = await this.getReceivedFriendRequestsUseCase.execute(userId);

    return result;
  }

  @Mutation(() => SendFriendRequestPayload)
  async sendFriendRequest(
    @CurrentUser('id') userId: string,
    @Args('addresseeId') addresseeId: string,
  ): Promise<SendFriendRequestPayload> {
    const result = await this.sendFriendRequestUseCase.execute(
      userId,
      addresseeId,
    );

    const message =
      result.status === FriendshipStatus.ACCEPTED
        ? 'Hai bạn đã trở thành bạn bè'
        : 'Gửi lời mời kết bạn thành công';

    return {
      success: true,
      message,
      data: {
        id: result.id || '',
        requesterId: result.requesterId,
        addresseeId: result.addresseeId,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    };
  }
}
