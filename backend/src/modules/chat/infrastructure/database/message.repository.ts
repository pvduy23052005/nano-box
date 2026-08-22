import { Injectable } from '@nestjs/common';
import { MessageRepositoryAdapter } from '../../application/ports/message.port';
import { MessageEntity } from '../../domain/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './message.schema';
import { Model, Types } from 'mongoose';
import { MessageType } from '../../domain/message.type';
import {
  CursorPagination,
  PaginationResult,
} from '../../application/dto/pagination.type';

@Injectable()
export class MesageRepository implements MessageRepositoryAdapter {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  private toPersistence(message: MessageEntity) {
    return {
      content: message.getContent(),
      attachments: message.getAttachments(),
      senderId: message.getSenderId(),
      readBy: message.getReadBy(),
    };
  }

  private toDTO(document: MessageDocument): MessageType {
    return {
      id: document._id.toString() || '',
      senderId: document.senderId.toString(),
      content: document.content || '',
      attachments: document.attachments,
      readBy: document.readBy,
    };
  }

  async save(message: MessageEntity): Promise<MessageType> {
    const persistenceData = this.toPersistence(message);
    const newMessage = new this.messageModel(persistenceData);
    const saved = await newMessage.save();
    return this.toDTO(saved);
  }

  async findAll({
    cursor,
    limit = 10,
  }: CursorPagination): Promise<PaginationResult<MessageType>> {
    const safeLimit = Math.min(Math.max(Number(limit || 10), 1), 10);

    const filterQuery: Record<string, unknown> = {};
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
      items: itemsToReturn.map((doc) => this.toDTO(doc)),
      nextCursor: nextCursor,
      hasmore: hasMore,
    };
  }
}
