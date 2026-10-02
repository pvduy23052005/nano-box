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
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FRIENDSHIP_SOCKET_EVENTS } from '../gateway/friendship.event';
import { NOTIFICATION_EVENTS } from 'src/modules/notification/presentation/listener/notification.event';

@Resolver()
@UseGuards(AuthGuard)
export class FriendshipResolver {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly getReceivedFriendRequestsUseCase: GetReceivedFriendRequestsUseCase,
    private readonly cancelFriendRequestUseCase: CancelFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly websocketService: WebsocketService,
    private readonly eventEmitter: EventEmitter2,
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

    if (result.status === FriendshipStatus.PENDING) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.FRIEND_REQUEST, {
        requesterId: userId,
        addresseeId,
        friendshipId: result.id || '',
        createdAt: result.createdAt,
      });
    } else if (result.status === FriendshipStatus.ACCEPTED) {
      this.websocketService.server
        .to(addresseeId)
        .emit(FRIENDSHIP_SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, {
          id: result.id || '',
          requesterId: result.addresseeId,
          addresseeId: result.requesterId,
          status: result.status,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        });
    }

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

  @Mutation(() => CancelFriendRequestPayload)
  async cancelFriendRequest(
    @CurrentUser('id') userId: string,
    @Args('friendId') friendId: string,
  ): Promise<CancelFriendRequestPayload> {
    const result = await this.cancelFriendRequestUseCase.execute(
      userId,
      friendId,
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
    @Args('friendId') friendId: string,
  ): Promise<RejectFriendRequestPayload> {
    const result = await this.rejectFriendRequestUseCase.execute(
      userId,
      friendId,
    );

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
    @Args('friendId') friendId: string,
  ): Promise<AcceptFriendRequestPayload> {
    const result = await this.acceptFriendRequestUseCase.execute(
      userId,
      friendId,
    );

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
