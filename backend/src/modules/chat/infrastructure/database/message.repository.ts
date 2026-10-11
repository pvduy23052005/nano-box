import {
  CursorPagination,
  PaginationResult,
} from '../../application/dto/pagination.type';
import { Injectable } from '@nestjs/common';
import { MessageRepositoryAdapter } from '../../application/ports/message.port';
import { MessageEntity } from '../../domain/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './message.schema';
import { Model, Types } from 'mongoose';
import { MessageType } from '../../domain/message.type';

interface RawReactionRecord {
  emoji?: string;
  user_ids?: string[];
  userIds?: string[];
}

interface RawMessageRecord {
  _id?: Types.ObjectId | string;
  content?: string;
  attachments?: string[];
  sender_id?: string;
  senderId?: string;
  sender_avatar?: string | null;
  senderAvatar?: string | null;
  sender_name?: string | null;
  senderName?: string | null;
  room_id?: string;
  roomId?: string;
  read_by?: string[];
  readBy?: string[];
  reactions?: RawReactionRecord[];
  is_system?: boolean;
  isSystem?: boolean;
  created_at?: Date | null;
  createdAt?: Date | null;
}

@Injectable()
export class MessageRepository implements MessageRepositoryAdapter {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  private toPersistence(message: MessageEntity): Partial<Message> {
    const persistence: Partial<Message> = {
      content: message.getContent(),
      attachments: message.getAttachments(),
      room_id: message.getRoomId(),
      read_by: message.getReadBy(),
      sender_avatar: message.getSenderAvatar() ?? null,
      sender_name: message.getSenderName() ?? null,
      reactions:
        message.getReactions()?.map((reaction) => ({
          emoji: reaction.emoji,
          user_ids: reaction.userIds,
        })) ?? [],
      is_system: message.getIsSystem(),
    };
    const senderId = message.getSenderId();
    if (senderId) {
      persistence.sender_id = senderId;
    }
    return persistence;
  }

  private toDTO(document: MessageDocument | RawMessageRecord): MessageType {
    const record: RawMessageRecord =
      'toObject' in document && typeof document.toObject === 'function'
        ? document.toObject()
        : document;

    const senderId = record.sender_id ?? record.senderId ?? '';
    const roomId = record.room_id ?? record.roomId ?? '';
    const readBy = record.read_by ?? record.readBy ?? [];
    const rawReactions = record.reactions ?? [];
    const reactions = Array.isArray(rawReactions) ? rawReactions : [];
    const senderAvatar = record.sender_avatar ?? record.senderAvatar ?? null;
    const senderName = record.sender_name ?? record.senderName ?? null;
    const createdAt = record.created_at ?? record.createdAt ?? null;
    const isSystem =
      record.is_system ?? record.isSystem ?? senderId === 'system';

    return {
      id: record._id?.toString() ?? '',
      senderId: String(senderId),
      senderAvatar,
      senderName,
      avatar: senderAvatar,
      roomId: String(roomId),
      content: record.content ?? '',
      attachments: Array.isArray(record.attachments) ? record.attachments : [],
      readBy: Array.isArray(readBy) ? readBy : [],
      isSystem,
      createdAt,
      reactions: reactions.map((reaction) => ({
        emoji: reaction.emoji ?? '',
        userIds: Array.isArray(reaction.user_ids ?? reaction.userIds)
          ? ((reaction.user_ids ?? reaction.userIds) as string[])
          : [],
      })),
    };
  }

  async save(message: MessageEntity): Promise<MessageType> {
    const persistenceData = this.toPersistence(message);
    const newMessage = new this.messageModel(persistenceData);
    const saved = await newMessage.save();
    return this.toDTO(saved);
  }

  async update(message: MessageEntity): Promise<MessageType> {
    const id = message.getId();
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new Error('Invalid message ID for update');
    }

    const reactions =
      message.getReactions()?.map((reaction) => ({
        emoji: reaction.emoji,
        user_ids: reaction.userIds,
      })) ?? [];

    const updated = await this.messageModel
      .findByIdAndUpdate(
        id,
        { $set: { reactions } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updated) {
      throw new Error('Message not found for update');
    }
    return this.toDTO(updated);
  }

  async findById(id: string): Promise<MessageEntity | null> {
    if (!id || !Types.ObjectId.isValid(id)) return null;
    const doc = await this.messageModel.findById(id).exec();
    if (!doc) return null;
    return MessageEntity.restore(this.toDTO(doc));
  }

  async findAll({
    cursor,
    limit = 10,
    roomId,
  }: CursorPagination): Promise<PaginationResult<MessageType>> {
    const safeLimit = Math.min(Math.max(Number(limit || 10), 1), 10);

    const filterQuery: Record<string, unknown> = {};
    if (roomId) {
      filterQuery.room_id = roomId;
    }
    if (cursor && Types.ObjectId.isValid(cursor)) {
      filterQuery._id = { $lt: new Types.ObjectId(cursor) };
    }

    const docs = await this.messageModel
      .find(filterQuery)
      .sort({ _id: -1 })
      .limit(safeLimit + 1)
      .lean()
      .exec();

    const hasMore = docs.length > safeLimit;
    const itemsToReturn = hasMore ? docs.slice(0, safeLimit) : docs;

    const nextCursor = hasMore
      ? itemsToReturn[itemsToReturn.length - 1]._id.toString()
      : null;

    return {
      items: itemsToReturn.reverse().map((doc) => this.toDTO(doc)),
      nextCursor: nextCursor,
      hasmore: hasMore,
    };
  }
}
