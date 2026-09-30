import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/modules/user/user.module';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FriendshipRepositoryAdapter } from './applications/ports/friendship.port';
import { GetReceivedFriendRequestsUseCase } from './applications/use-case/get-received-friend-requests.use-case';
import { SendFriendRequestUseCase } from './applications/use-case/send-friend-request.use-case';
import { CancelFriendRequestUseCase } from './applications/use-case/cancel-friend-request.use-case';
import { RejectFriendRequestUseCase } from './applications/use-case/reject-friend-request.use-case';
import { FriendshipRepository } from './infrastructure/friendship.repository';
import {
  Friendship,
  FriendshipSchema,
} from './infrastructure/friendship.schema';
import { FriendshipResolver } from './presentation/graphql/friendship.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    UserModule,
  ],
  providers: [
    FriendshipResolver,
    {
      provide: FriendshipRepositoryAdapter,
      useClass: FriendshipRepository,
    },
    {
      provide: SendFriendRequestUseCase,
      useFactory: (
        friendshipRepository: FriendshipRepositoryAdapter,
        userRepository: UserRepositoryAdapter,
      ) => new SendFriendRequestUseCase(friendshipRepository, userRepository),
      inject: [FriendshipRepositoryAdapter, UserRepositoryAdapter],
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
  ],
  exports: [
    FriendshipRepositoryAdapter,
    SendFriendRequestUseCase,
    GetReceivedFriendRequestsUseCase,
    CancelFriendRequestUseCase,
    RejectFriendRequestUseCase,
  ],
})
export class FriendshipModule {}
