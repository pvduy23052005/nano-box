import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatPayload } from '../dto/chat.payload';
import { GetMessagesUseCase } from '../../application/use-cases/get-message.use-case';
import { MessageInput } from '../dto/message.input';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UploadService } from 'src/infrastructure/upload/upload.service';
import { CHAT_SOCKET_EVENTS } from '../gateway/event.type';
import { UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Resolver()
@UseGuards(AuthGuard)
export class ChatResolver {
  private readonly logger = new Logger(ChatResolver.name);

  constructor(
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly webSocketService: WebsocketService,
    private readonly uploadService: UploadService,
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
    @Args('input') input: MessageInput,
    @CurrentUser('id') userId: string,
  ) {
    const attachments: string[] = [];
    const tempKeysToDelete: string[] = [];

    if (input.tempKeys?.length) {
      const copyResults = await Promise.all(
        input.tempKeys.map((tempKey) =>
          this.uploadService.copyTempToUploads(tempKey),
        ),
      );
      attachments.push(...copyResults);
      tempKeysToDelete.push(...input.tempKeys);
    }

    const message = await this.sendMessageUseCase.execute({
      content: input.content,
      senderId: userId,
      attachments,
    });

    if (tempKeysToDelete.length) {
      Promise.all(
        tempKeysToDelete.map((key) => this.uploadService.deleteTempFile(key)),
      ).catch((err) =>
        this.logger.warn(`Failed to delete temp files: ${err}`),
      );
    }

    const server = this.webSocketService.server;
    server.emit(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    return message;
  }
}

