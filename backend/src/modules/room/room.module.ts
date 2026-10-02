import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './infrastructure/room.schema';
import {
  Message,
  MessageSchema,
} from '../chat/infrastructure/database/message.schema';
import { User, UserSchema } from '../user/infrastructure/databases/user.schema';
import {
  RoomResolver,
  RoomMemberResolver,
} from './presentation/graphql/room.graphql';
import { RoomRepositoryAdapter } from './application/ports/room.ports';
import { RoomRepository } from './infrastructure/room.repository';
import { CreateSingleRoomUseCase } from './application/use-cases/create-single-room';
import { GetRoomsByStatusUseCase } from './application/use-cases/get-rooms-by-status';
import { UpdateMemberLastReadMessageUseCase } from './application/use-cases/update-member-last-read-message';
import { EnsureFriendRoomUseCase } from './application/use-cases/ensure-friend-room.use-case';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  providers: [
    RoomResolver,
    RoomMemberResolver,
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
      provide: GetRoomsByStatusUseCase,
      useFactory: (roomRepository: RoomRepositoryAdapter) =>
        new GetRoomsByStatusUseCase(roomRepository),
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
  ],
  exports: [
    CreateSingleRoomUseCase,
    GetRoomsByStatusUseCase,
    UpdateMemberLastReadMessageUseCase,
    EnsureFriendRoomUseCase,
    RoomRepositoryAdapter,
  ],
})
export class RoomModule {}
