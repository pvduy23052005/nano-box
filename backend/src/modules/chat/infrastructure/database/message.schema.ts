import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


@Schema({ _id: false })
export class Reaction {
  @Prop({ required: true, trim: true })
  emoji: string;

  @Prop({ type: [String], default: [] })
  user_ids: string[];
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'messages',
})
export class Message {
  @Prop({ required: true, trim: true, index: true })
  sender_id: string;

  @Prop({ required: true, index: true })
  room_id: string;

  @Prop({ trim: true })
  content: string;

  @Prop({ default: [], type: [String] })
  attachments: string[];

  @Prop({ type: [Reaction], default: [] })
  reactions: Reaction[];

  @Prop({ default: [], type: [String] })
  read_by: string[];
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ room_id: 1, created_at: -1 });
