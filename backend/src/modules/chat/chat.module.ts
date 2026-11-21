import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from '../room/room.module';
import { RoomRepositoryAdapter } from '../room/application/ports/room.ports';
import { MessageRepositoryAdapter } from './application/ports/message.port';
import { UploadAdapter } from './application/ports/upload.port';
import { AddEmojiMessageUseCase } from './application/use-cases/add-emoji-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-message.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { SendSystemMessageUseCase } from './application/use-cases/send-system-message.use-case';
import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';
import { MessageRepository } from './infrastructure/database/message.repository';
import { GrpcUploadAdapter } from './infrastructure/externals/grpc-upload.adapter';
import { ChatGateway } from './presentation/gateway/chat.gateway';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { ChatListener } from './presentation/listener/chat.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'UPLOAD_GRPC_PACKAGE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const protoPath =
            [
              join(__dirname, '../../../proto/upload.proto'),
              join(__dirname, '../../proto/upload.proto'),
              join(process.cwd(), 'dist/proto/upload.proto'),
              join(process.cwd(), 'src/proto/upload.proto'),
              join(process.cwd(), '../proto/upload.proto'),
            ].find((p) => existsSync(p)) ||
            join(__dirname, '../../../proto/upload.proto');

          return {
            transport: Transport.GRPC,
            options: {
              package: 'upload',
              protoPath,
              url: configService.get<string>(
                'UPLOAD_GRPC_URL',
                'localhost:50052',
              ),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    RoomModule,
  ],
  providers: [
    ChatResolver,
    ChatGateway,
    ChatListener,
    {
      provide: UploadAdapter,
      useClass: GrpcUploadAdapter,
    },
    {
      provide: MessageRepositoryAdapter,
      useClass: MessageRepository,
    },
    {
      provide: SendMessageUseCase,
      useFactory: (
        messageRepository: MessageRepositoryAdapter,
        roomRepository: RoomRepositoryAdapter,
        uploadAdapter: UploadAdapter,
      ) =>
        new SendMessageUseCase(
          messageRepository,
          roomRepository,
          uploadAdapter,
        ),
      inject: [MessageRepositoryAdapter, RoomRepositoryAdapter, UploadAdapter],
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
