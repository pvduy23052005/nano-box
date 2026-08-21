import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'messages',
})
export class Message {
  @Prop({ required: true, trim: true, index: true })
  senderId: string;

  @Prop({ trim: true })
  content: string;

  @Prop({ default: [], type: [String] })
  attachments: string[];

  @Prop({ default: [], type: [String] })
  readBy: string[];
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);
