import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventGateway } from './presentation/gateway/event.gateway';
import { MesageRepository } from './infrastructure/database/message.repository';
import { MessageRepositoryAdapter } from './application/ports/message.port';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { GetMessagesUseCase } from './application/use-cases/get-message.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [
    EventGateway,
    ChatResolver,
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
