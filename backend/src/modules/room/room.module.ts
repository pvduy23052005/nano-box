import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './infrastructure/room.schema';
import {
  Message,
  MessageSchema,
} from '../chat/infrastructure/database/message.schema';
import { User, UserSchema } from '../user/infrastructure/databases/user.schema';
import { RoomResolver } from './presentation/graphql/room.resolver';
import { RoomRepositoryAdapter } from './application/ports/room.ports';
import { RoomRepository } from './infrastructure/room.repository';
import { CreateSingleRoomUseCase } from './application/use-cases/create-single-room';
import { CreateGroupRoomUseCase } from './application/use-cases/create-group-room';
import { GetRoomsByStatusUseCase } from './application/use-cases/get-rooms-by-status';
import { GetRoomDetailUseCase } from './application/use-cases/get-room-detail.use-case';
import { UpdateMemberLastReadMessageUseCase } from './application/use-cases/update-member-last-read-message';
import { EnsureFriendRoomUseCase } from './application/use-cases/ensure-friend-room.use-case';
import { UpdateRoomProfileUseCase } from './application/use-cases/update-room-profile.use-case';
import { AddMemberToRoomUseCase } from './application/use-cases/add-member-to-room.use-case';
import { RemoveMemberFromRoomUseCase } from './application/use-cases/remove-member-from-room.use-case';
import { AssignRoomAdminUseCase } from './application/use-cases/assign-room-admin.use-case';
import { RevokeRoomAdminUseCase } from './application/use-cases/revoke-room-admin.use-case';
import { UserModule } from '../user/user.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { FriendshipRepositoryAdapter } from '../friendship/applications/ports/friendship.port';
import { RoomListener } from './presentation/listener/room.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    forwardRef(() => FriendshipModule),
  ],
  providers: [
    RoomResolver,
    RoomListener,
    {
      provide: RoomRepositoryAdapter,
      useClass: RoomRepository,
    },
    {
      provide: CreateSingleRoomUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new CreateSingleRoomUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: CreateGroupRoomUseCase,
      useFactory: (
        roomRepository: RoomRepositoryAdapter,
        friendshipRepository: FriendshipRepositoryAdapter,
      ) => new CreateGroupRoomUseCase(roomRepository, friendshipRepository),
      inject: [RoomRepositoryAdapter, FriendshipRepositoryAdapter],
    },
    {
      provide: GetRoomsByStatusUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new GetRoomsByStatusUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: GetRoomDetailUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new GetRoomDetailUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: UpdateMemberLastReadMessageUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new UpdateMemberLastReadMessageUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: EnsureFriendRoomUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new EnsureFriendRoomUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: UpdateRoomProfileUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new UpdateRoomProfileUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: AddMemberToRoomUseCase,
      useFactory: (
        roomRepository: RoomRepositoryAdapter,
        friendshipRepository: FriendshipRepositoryAdapter,
      ) => new AddMemberToRoomUseCase(roomRepository, friendshipRepository),
      inject: [RoomRepositoryAdapter, FriendshipRepositoryAdapter],
    },
    {
      provide: RemoveMemberFromRoomUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new RemoveMemberFromRoomUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: AssignRoomAdminUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new AssignRoomAdminUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
    {
      provide: RevokeRoomAdminUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new RevokeRoomAdminUseCase(roomRepository),
      inject: [RoomRepositoryAdapter],
    },
  ],
  exports: [
    CreateSingleRoomUseCase,
    CreateGroupRoomUseCase,
    GetRoomsByStatusUseCase,
    GetRoomDetailUseCase,
    UpdateMemberLastReadMessageUseCase,
    EnsureFriendRoomUseCase,
    UpdateRoomProfileUseCase,
    AddMemberToRoomUseCase,
    RemoveMemberFromRoomUseCase,
    AssignRoomAdminUseCase,
    RevokeRoomAdminUseCase,
    RoomRepositoryAdapter,
  ],
})
export class RoomModule {}
