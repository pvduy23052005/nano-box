import {
  SendFriendRequestPayload,
  GetReceivedFriendRequestPayload,
  CancelFriendRequestPayload,
  RejectFriendRequestPayload,
  AcceptFriendRequestPayload,
} from '../dto/friendship.payload';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FriendshipStatus } from '../../domain/friendship.type';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { SendFriendRequestUseCase } from '../../applications/use-case/send-friend-request.use-case';
import { GetReceivedFriendRequestsUseCase } from '../../applications/use-case/get-received-friend-requests.use-case';
import { CancelFriendRequestUseCase } from '../../applications/use-case/cancel-friend-request.use-case';
import { RejectFriendRequestUseCase } from '../../applications/use-case/reject-friend-request.use-case';
import { AcceptFriendRequestUseCase } from '../../applications/use-case/accept-friend-request.use-case';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FRIENDSHIP_INTERNAL_EVENTS } from '../gateway/friendship.event';
import { NOTIFICATION_EVENTS } from 'src/modules/notification/presentation/listener/notification.event';
import { GetFriendsUseCase } from '../../applications/use-case/get-friends.use-case';
import { UserProfilePayload } from 'src/modules/user/presentation/dto/profile.payload';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';

@Resolver()
@UseGuards(AuthGuard)
export class FriendshipResolver {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly getReceivedFriendRequestsUseCase: GetReceivedFriendRequestsUseCase,
    private readonly cancelFriendRequestUseCase: CancelFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Query(() => [GetReceivedFriendRequestPayload])
  async getReceivedFriendRequests(
    @CurrentUser('id') userId: string,
  ): Promise<GetReceivedFriendRequestPayload[]> {
    const result = await this.getReceivedFriendRequestsUseCase.execute(userId);

    return result;
  }

  @Query(() => [UserProfilePayload])
  async getFriends(
    @CurrentUser('id') userId: string,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<UserProfilePayload[]> {
    return await this.getFriendsUseCase.execute(userId, search);
  }

  @Mutation(() => SendFriendRequestPayload)
  async sendFriendRequest(
    @CurrentUser('id') myId: string,
    @Args('addresseeId', ParseObjectIdPipe) addresseeId: string,
  ): Promise<SendFriendRequestPayload> {
    const result = await this.sendFriendRequestUseCase.execute(
      myId,
      addresseeId,
    );

    const message =
      result.status === FriendshipStatus.ACCEPTED
        ? 'Hai bạn đã trở thành bạn bè'
        : 'Gửi lời mời kết bạn thành công';

    if (result.status === FriendshipStatus.PENDING) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.FRIEND_REQUEST, {
        requesterId: myId,
        addresseeId,
        friendshipId: result.id ?? '',
        createdAt: result.createdAt,
        requesterName: result.requesterName || 'Người dùng',
        requesterAvatar: result.requesterAvatar ?? null,
        requesterEmail: result.requesterEmail,
      });
    } else if (result.status === FriendshipStatus.ACCEPTED) {
      this.eventEmitter.emit(
        FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_ACCEPTED,
        {
          friendshipId: result.id ?? '',
          actorId: myId,
          targetId: addresseeId,
          status: result.status,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      );
    }

    return {
      success: true,
      message,
      data: {
        id: result.id ?? '',
        requesterId: result.requesterId,
        addresseeId: result.addresseeId,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    };
  }

  @Mutation(() => CancelFriendRequestPayload)
  async cancelFriendRequest(
    @CurrentUser('id') userId: string,
    @Args('friendId', ParseObjectIdPipe) friendId: string,
  ): Promise<CancelFriendRequestPayload> {
    const result = await this.cancelFriendRequestUseCase.execute(
      userId,
      friendId,
    );

    this.eventEmitter.emit(
      FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_CANCELLED,
      {
        friendshipId: result.id || '',
        actorId: userId,
        targetId: result.addresseeId,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    );

    return {
      success: true,
      message: 'Hủy lời mời kết bạn thành công',
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

  @Mutation(() => RejectFriendRequestPayload)
  async rejectFriendRequest(
    @CurrentUser('id') userId: string,
    @Args('friendId', ParseObjectIdPipe) friendId: string,
  ): Promise<RejectFriendRequestPayload> {
    const result = await this.rejectFriendRequestUseCase.execute(
      userId,
      friendId,
    );

    this.eventEmitter.emit(FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_REJECTED, {
      friendshipId: result.id || '',
      actorId: userId,
      targetId: result.requesterId,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });

    return {
      success: true,
      message: 'Từ chối lời mời kết bạn thành công',
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

  @Mutation(() => AcceptFriendRequestPayload)
  async acceptFriendRequest(
    @CurrentUser('id') userId: string,
    @Args('friendId', ParseObjectIdPipe) friendId: string,
  ): Promise<AcceptFriendRequestPayload> {
    const result = await this.acceptFriendRequestUseCase.execute(
      userId,
      friendId,
    );

    const targetId =
      result.requesterId === userId ? result.addresseeId : result.requesterId;

    this.eventEmitter.emit(FRIENDSHIP_INTERNAL_EVENTS.FRIEND_REQUEST_ACCEPTED, {
      friendshipId: result.id || '',
      actorId: userId,
      targetId,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });

    return {
      success: true,
      message: 'Chấp nhận lời mời kết bạn thành công',
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
