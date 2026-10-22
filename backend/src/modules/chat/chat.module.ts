import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from 'src/infrastructure/upload/upload.module';
import { RoomRepositoryAdapter } from '../room/application/ports/room.ports';
import { RoomModule } from '../room/room.module';
import { MessageRepositoryAdapter } from './application/ports/message.port';
import { AddEmojiMessageUseCase } from './application/use-cases/add-emoji-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-message.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { SendSystemMessageUseCase } from './application/use-cases/send-system-message.use-case';
import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';
import { MessageRepository } from './infrastructure/database/message.repository';
import { ChatGateway } from './presentation/gateway/chat.gateway';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { ChatListener } from './presentation/listener/chat.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UploadModule,
    RoomModule,
  ],
  providers: [
    ChatResolver,
    ChatGateway,
    ChatListener,
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
      provide: SendSystemMessageUseCase,
      useFactory: (
        messageRepository: MessageRepositoryAdapter,
        roomRepository: RoomRepositoryAdapter,
      ) => new SendSystemMessageUseCase(messageRepository, roomRepository),
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
    {
      provide: AddEmojiMessageUseCase,
      useFactory: (
        messageRepository: MessageRepositoryAdapter,
        roomRepository: RoomRepositoryAdapter,
      ) => new AddEmojiMessageUseCase(messageRepository, roomRepository),
      inject: [MessageRepositoryAdapter, RoomRepositoryAdapter],
    },
  ],
  exports: [
    SendMessageUseCase,
    SendSystemMessageUseCase,
    AddEmojiMessageUseCase,
  ],
})
export class ChatModule {}
