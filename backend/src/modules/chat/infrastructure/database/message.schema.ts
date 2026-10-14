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
  strict: false,
})
export class Message {
  @Prop({ required: true, trim: true, index: true })
  sender_id: string;

  @Prop({ type: String, default: null })
  sender_avatar?: string | null;

  @Prop({ type: String, default: null })
  sender_name?: string | null;

  @Prop({ required: true })
  room_id: string;

  @Prop({ trim: true })
  content: string;

  @Prop({ default: [], type: [String] })
  attachments: string[];

  @Prop({ type: [Reaction], default: [] })
  reactions: Reaction[];

  @Prop({ default: [], type: [String] })
  read_by: string[];

  @Prop({ type: Boolean, default: false, index: true })
  is_system?: boolean;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ room_id: 1, _id: -1 });
