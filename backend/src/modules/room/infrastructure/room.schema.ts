import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Member, MemberSchema } from './member.schema';
import { RoomType } from '../domain/chat.enum';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'rooms',
})
export class Room {
  @Prop({ type: String, trim: true, default: null })
  title: string | null;

  @Prop({
    type: String,
    enum: [RoomType.SINGLE, RoomType.GROUP],
    default: RoomType.SINGLE,
    required: true,
    index: true,
  })
  type_room: RoomType;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Message', default: null })
  last_message_id: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  avatar: string | null;

  @Prop({ type: [MemberSchema], default: [] })
  members: Member[];

  @Prop({ type: Boolean, default: false, index: true })
  deleted: boolean;
}

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.index({ 'members.user_id': 1, 'members.status': 1, updated_at: -1 });
