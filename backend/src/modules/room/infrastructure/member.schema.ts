import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MemberRole, MemberStatus } from './room.type';

@Schema({
  _id: false,
  timestamps: { createdAt: 'joined_at', updatedAt: false },
})
export class Member {
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
    default: MemberStatus.WAITING,
    required: true,
  })
  status: MemberStatus;

  @Prop({ type: Date, default: Date.now })
  joined_at: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
