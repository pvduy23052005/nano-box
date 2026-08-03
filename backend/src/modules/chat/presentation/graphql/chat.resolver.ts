import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatPayload } from '../dto/chat.payload';
import { GetMessagesUseCase } from '../../application/use-cases/get-message.use-case';
import { MessageInput } from '../dto/message.input';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { SOCKET_EVENTS } from '../gateway/event.type';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Resolver()
@UseGuards(AuthGuard)
export class ChatResolver {
  constructor(
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly webSocketService: WebsocketService
  ) { }

  @Query(() => [ChatPayload])
  async getMessages(): Promise<ChatPayload[]> {
    const messages = await this.getMessagesUseCase.execute();
    return messages.map((msg) => ({
      id: msg.id as string,
      content: msg.content,
      senderId: msg.senderId,
      attachments: msg.attachments || [],
      readBy: msg.readBy || [],
    }));
  }

  @Mutation(() => ChatPayload)
  async sendMessage(
    @Args("input") input: MessageInput,
    @CurrentUser("id") userId: string
  ) {
    const message = await this.sendMessageUseCase.execute({ ...input, senderId: userId });

    const server = this.webSocketService.server;
    server.emit(SOCKET_EVENTS.CHAT.RECEIVE_MESSAGE, message);
    return message;
  }
}
