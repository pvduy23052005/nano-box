import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/modules/user/user.module';
import { RoomModule } from 'src/modules/room/room.module';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FriendshipRepositoryAdapter } from './applications/ports/friendship.port';
import { GetReceivedFriendRequestsUseCase } from './applications/use-case/get-received-friend-requests.use-case';
import { SendFriendRequestUseCase } from './applications/use-case/send-friend-request.use-case';
import { CancelFriendRequestUseCase } from './applications/use-case/cancel-friend-request.use-case';
import { RejectFriendRequestUseCase } from './applications/use-case/reject-friend-request.use-case';
import { AcceptFriendRequestUseCase } from './applications/use-case/accept-friend-request.use-case';
import { GetFriendsUseCase } from './applications/use-case/get-friends.use-case';
import { FriendshipRepository } from './infrastructure/friendship.repository';
import {
  Friendship,
  FriendshipSchema,
} from './infrastructure/friendship.schema';
import { User, UserSchema } from '../user/infrastructure/databases/user.schema';
import { FriendshipResolver } from './presentation/graphql/friendship.resolver';
import { FriendshipListener } from './presentation/listener/friendship.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    forwardRef(() => RoomModule),
  ],
  providers: [
    FriendshipResolver,
    FriendshipListener,
    {
      provide: FriendshipRepositoryAdapter,
      useClass: FriendshipRepository,
    },
    {
      provide: SendFriendRequestUseCase,
      useFactory: (
        friendshipRepository: FriendshipRepositoryAdapter,
        userRepository: UserRepositoryAdapter,
        ensureFriendRoomUseCase: EnsureFriendRoomUseCase,
      ) =>
        new SendFriendRequestUseCase(
          friendshipRepository,
          userRepository,
          ensureFriendRoomUseCase,
        ),
      inject: [
        FriendshipRepositoryAdapter,
        UserRepositoryAdapter,
        EnsureFriendRoomUseCase,
      ],
    },
    {
      provide: GetReceivedFriendRequestsUseCase,
      useFactory: (friendshipRepository: FriendshipRepositoryAdapter) =>
        new GetReceivedFriendRequestsUseCase(friendshipRepository),
      inject: [FriendshipRepositoryAdapter],
    },
    {
      provide: CancelFriendRequestUseCase,
      useFactory: (friendshipRepository: FriendshipRepositoryAdapter) =>
        new CancelFriendRequestUseCase(friendshipRepository),
      inject: [FriendshipRepositoryAdapter],
    },
    {
      provide: RejectFriendRequestUseCase,
      useFactory: (friendshipRepository: FriendshipRepositoryAdapter) =>
        new RejectFriendRequestUseCase(friendshipRepository),
      inject: [FriendshipRepositoryAdapter],
    },
    {
      provide: AcceptFriendRequestUseCase,
      useFactory: (
        friendshipRepository: FriendshipRepositoryAdapter,
        ensureFriendRoomUseCase: EnsureFriendRoomUseCase,
      ) =>
        new AcceptFriendRequestUseCase(
          friendshipRepository,
          ensureFriendRoomUseCase,
        ),
      inject: [FriendshipRepositoryAdapter, EnsureFriendRoomUseCase],
    },
    {
      provide: GetFriendsUseCase,
      useFactory: (friendshipRepository: FriendshipRepositoryAdapter) =>
        new GetFriendsUseCase(friendshipRepository),
      inject: [FriendshipRepositoryAdapter],
    },
  ],
  exports: [
    FriendshipRepositoryAdapter,
    SendFriendRequestUseCase,
    GetReceivedFriendRequestsUseCase,
    CancelFriendRequestUseCase,
    RejectFriendRequestUseCase,
    AcceptFriendRequestUseCase,
    GetFriendsUseCase,
  ],
})
export class FriendshipModule {}
