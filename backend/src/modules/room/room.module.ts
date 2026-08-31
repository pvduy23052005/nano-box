import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './infrastructure/room.schema';
import { RoomResolver } from './presentation/graphql/room.graphql';
import { RoomRepositoryAdapter } from './application/ports/room.ports';
import { RoomRepository } from './infrastructure/room.repository';
import { CreateSingleRoomUseCase } from './application/use-cases/create-single-room';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
  ],
  providers: [
    RoomResolver,
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
  ],
  exports: [CreateSingleRoomUseCase],
})
export class RoomModule { }
