import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventGateway } from './presentation/gateway/event.gateway';
import { MesageRepository } from './infrastructure/database/message.repository';
import { MessageRepositoryAdapter } from './application/ports/mesage.port';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import {
  Message,
  MessageSchema,
} from './infrastructure/database/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [
    EventGateway,
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
  ],
  exports: [SendMessageUseCase],
})
export class ChatModule {}
