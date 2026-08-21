import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MesageRepository } from './infrastructure/database/message.repository';
import { MessageRepositoryAdapter } from './application/ports/message.port';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { GetMessagesUseCase } from './application/use-cases/get-message.use-case';
import { ChatGateway } from './presentation/gateway/chat.gateway';
import { UploadModule } from 'src/infrastructure/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UploadModule,
  ],
  providers: [
    ChatResolver,
    ChatGateway,
    {
      provide: MessageRepositoryAdapter,
      useClass: MesageRepository,
    },
    {
      provide: SendMessageUseCase,
      useFactory: (messageRepository: MessageRepositoryAdapter) =>
        new SendMessageUseCase(messageRepository),
      inject: [MessageRepositoryAdapter],
    },
    {
      provide: GetMessagesUseCase,
      useFactory: (messageRepository: MessageRepositoryAdapter) =>
        new GetMessagesUseCase(messageRepository),
      inject: [MessageRepositoryAdapter],
    },
  ],
  exports: [SendMessageUseCase],
})
export class ChatModule {}
