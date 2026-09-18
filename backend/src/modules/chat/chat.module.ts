import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from './infrastructure/database/message.repository';
import { MessageRepositoryAdapter } from './application/ports/message.port';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { GetMessagesUseCase } from './application/use-cases/get-message.use-case';
import { ChatGateway } from './presentation/gateway/chat.gateway';
import { UploadModule } from 'src/infrastructure/upload/upload.module';
import { RoomModule } from '../room/room.module';
import { RoomRepositoryAdapter } from '../room/application/ports/room.ports';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UploadModule,
    RoomModule,
  ],
  providers: [
    ChatResolver,
    ChatGateway,
    {
      provide: MessageRepositoryAdapter,
      useClass: MessageRepository,
    },
    {
      provide: SendMessageUseCase,
      useFactory: (
        messageRepository: MessageRepositoryAdapter,
        roomRepository: RoomRepositoryAdapter,
      ) => new SendMessageUseCase(messageRepository, roomRepository),
      inject: [MessageRepositoryAdapter, RoomRepositoryAdapter],
    },
    {
      provide: GetMessagesUseCase,
      useFactory: (
        messageRepository: MessageRepositoryAdapter,
        roomRepository: RoomRepositoryAdapter,
      ) => new GetMessagesUseCase(messageRepository, roomRepository),
      inject: [MessageRepositoryAdapter, RoomRepositoryAdapter],
    },
  ],
  exports: [SendMessageUseCase],
})
export class ChatModule {}
