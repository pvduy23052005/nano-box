import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MemberRole, MemberStatus } from '../domain/chat.enum';

@Schema({
  _id: false,
  timestamps: { createdAt: 'joined_at', updatedAt: false },
})
export class RoomMember {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: MemberRole,
    default: MemberRole.MEMBER,
    required: true,
  })
  role: MemberRole;

  @Prop({
    type: String,
    enum: MemberStatus,
    default: MemberStatus.WAITTING,
    required: true,
  })
  status: MemberStatus;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Message', default: null })
  last_read_message_id: Types.ObjectId | null;

  @Prop({ type: Date, default: Date.now })
  joined_at: Date;
}

export const RoomMemberSchema = SchemaFactory.createForClass(RoomMember);
