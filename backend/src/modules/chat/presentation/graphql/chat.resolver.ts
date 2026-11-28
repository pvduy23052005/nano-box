import {
  NOTIFICATION_EVENTS,
} from 'src/modules/notification/presentation/listener/notification.event';
import { UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RealtimePublisherService } from 'src/infrastructure/realtime/realtime-publisher.service';
import { AddEmojiMessageUseCase } from '../../application/use-cases/add-emoji-message.use-case';
import { GetMessagesUseCase } from '../../application/use-cases/get-message.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { AddEmojiMessageInput } from '../dto/add-emoji-message.input';
import { ChatPayload } from '../dto/chat.ouput';
import { MessageInput } from '../dto/message.input';
import { MessagesPagePayload } from '../dto/messages-page.payload';
import { CHAT_SOCKET_EVENTS } from '../gateway/event.type';

@Resolver()
@UseGuards(AuthGuard)
export class ChatResolver {
  constructor(
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly addEmojiMessageUseCase: AddEmojiMessageUseCase,
    private readonly realtimePublisher: RealtimePublisherService,
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
        mentionedUserIds: msg.mentionedUserIds || [],
        isSystem: msg.isSystem ?? msg.senderId === 'system',
        createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
      })),
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasMore,
    };
  }

  @Mutation(() => ChatPayload)
  async sendMessage(
    @Args('input') input: MessageInput,
    @CurrentUser('id') userId: string,
  ): Promise<ChatPayload> {
    const { message, memberIds } = await this.sendMessageUseCase.execute({
      content: input.content,
      senderId: userId,
      roomId: input.roomId,
      tempKeys: input.tempKeys,
      mentionedUserIds: input.mentionedUserIds,
    });

    if (memberIds.length) {
      await this.realtimePublisher.emit(
        memberIds,
        CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE,
        message,
      );
    }

    if (message.mentionedUserIds && message.mentionedUserIds.length > 0) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.MESSAGE_MENTION, {
        message,
        mentionedUserIds: message.mentionedUserIds,
        senderId: userId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
      });
    }

    return {
      ...message,
      id: message.id as string,
      attachments: message.attachments || [],
      readBy: message.readBy || [],
      createdAt: message.createdAt ? new Date(message.createdAt) : null,
      isSystem: message.isSystem ?? false,
    };
  }

  @Mutation(() => ChatPayload)
  async addEmojiMessage(
    @Args('input') input: AddEmojiMessageInput,
    @CurrentUser('id') userId: string,
  ): Promise<ChatPayload> {
    const { message, memberIds, reactorName, reactorAvatar } =
      await this.addEmojiMessageUseCase.execute({
        messageId: input.messageId,
        emoji: input.emoji,
        userId,
      });

    if (memberIds.length) {
      await this.realtimePublisher.emit(
        memberIds,
        CHAT_SOCKET_EVENTS.UPDATE_MESSAGE_REACTION,
        message,
      );
    }

    this.eventEmitter.emit(NOTIFICATION_EVENTS.MESSAGE_REACTION, {
      message,
      memberIds,
      reactorId: userId,
      reactorName: reactorName ?? undefined,
      reactorAvatar: reactorAvatar ?? undefined,
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
      createdAt: message.createdAt ? new Date(message.createdAt) : null,
    };
  }
}
