import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatPayload } from '../dto/chat.ouput';
import { MessagesPagePayload } from '../dto/messages-page.payload';
import { GetMessagesUseCase } from '../../application/use-cases/get-message.use-case';
import { MessageInput } from '../dto/message.input';
import { AddEmojiMessageInput } from '../dto/add-emoji-message.input';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { AddEmojiMessageUseCase } from '../../application/use-cases/add-emoji-message.use-case';
import { WebsocketService } from 'src/infrastructure/websocket/ws.service';
import { UploadService } from 'src/infrastructure/upload/upload.service';
import { CHAT_SOCKET_EVENTS } from '../gateway/event.type';
import { UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENTS } from 'src/modules/notification/presentation/listener/notification.event';

@Resolver()
@UseGuards(AuthGuard)
export class ChatResolver {
  private readonly logger = new Logger(ChatResolver.name);

  constructor(
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly addEmojiMessageUseCase: AddEmojiMessageUseCase,
    private readonly webSocketService: WebsocketService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Query(() => MessagesPagePayload)
  async getMessages(
    @Args('roomId') roomId: string,
    @CurrentUser('id') userId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<MessagesPagePayload> {
    const result = await this.getMessagesUseCase.execute(
      roomId,
      userId,
      cursor,
      limit,
    );

    return {
      items: result.items.map((msg) => ({
        id: msg.id as string,
        content: msg.content,
        senderId: msg.senderId,
        senderAvatar: msg.senderAvatar ?? msg.avatar ?? null,
        senderName: msg.senderName ?? null,
        avatar: msg.senderAvatar ?? msg.avatar ?? null,
        roomId: msg.roomId,
        attachments: msg.attachments || [],
        readBy: msg.readBy || [],
        reactions: msg.reactions || [],
        isSystem: msg.isSystem ?? (msg.senderId === 'system'),
        createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
      })),
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasmore,
    };
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

    const { message, memberIds } = await this.sendMessageUseCase.execute({
      content: input.content,
      senderId: userId,
      senderAvatar: input.senderAvatar,
      senderName: input.senderName,
      roomId: input.roomId,
      attachments,
    });

    if (tempKeysToDelete.length) {
      Promise.all(
        tempKeysToDelete.map((key) => this.uploadService.deleteTempFile(key)),
      ).catch((err) => this.logger.warn(`Failed to delete temp files: ${err}`));
    }

    const server = this.webSocketService.server;
    if (server && memberIds.length) {
      server
        .to([...memberIds, input.roomId])
        .emit(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    }

    return {
      ...message,
      isSystem: message.isSystem ?? false,
    };
  }

  @Mutation(() => ChatPayload)
  async addEmojiMessage(
    @Args('input') input: AddEmojiMessageInput,
    @CurrentUser('id') userId: string,
  ): Promise<ChatPayload> {
    const { message, memberIds } = await this.addEmojiMessageUseCase.execute({
      messageId: input.messageId,
      emoji: input.emoji,
      userId,
    });

    const server = this.webSocketService.server;
    if (server && memberIds.length) {
      server
        .to([...memberIds, message.roomId])
        .emit(CHAT_SOCKET_EVENTS.UPDATE_MESSAGE_REACTION, message);
    }

    this.eventEmitter.emit(NOTIFICATION_EVENTS.MESSAGE_REACTION, {
      message,
      memberIds,
      reactorId: userId,
      reactorName: input.userName,
      reactorAvatar: input.userAvatar,
      emoji: input.emoji,
    });

    return {
      id: message.id as string,
      content: message.content,
      senderId: message.senderId,
      roomId: message.roomId,
      attachments: message.attachments || [],
      readBy: message.readBy || [],
      reactions: message.reactions || [],
      isSystem: message.isSystem ?? false,
    };
  }
}
