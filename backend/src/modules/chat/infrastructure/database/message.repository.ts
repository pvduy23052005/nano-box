import { Injectable } from '@nestjs/common';
import { MessageRepositoryAdapter } from '../../application/ports/mesage.port';
import { MessageEntity } from '../../domain/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './message.schema';
import { Model } from 'mongoose';
import { MessageState } from '../../domain/message.type';

@Injectable()
export class MesageRepository implements MessageRepositoryAdapter {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) { }

  private toPersistence(message: MessageEntity) {
    return {
      content: message.getContent(),
      attachments: message.getAttachments(),
      readBy: message.getReadBy(),
    };
  }

  private toDTO(document: MessageDocument): MessageState {
    return {
      id: document._id.toString(),
      senderId: document.senderId.toString(),
      content: document.content,
      attachments: document.attachments,
      readBy: document.readBy,
    };
  }

  async save(message: MessageEntity): Promise<MessageState> {
    const persistenceData = this.toPersistence(message);
    const newMessage = new this.messageModel({ ...persistenceData, senderId: "8927398472893478" });
    const saved = await newMessage.save();
    return this.toDTO(saved);
  }
}
