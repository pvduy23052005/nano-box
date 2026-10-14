import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { FriendshipStatus } from '../domain/friendship.type';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'friendships',
})
export class Friendship {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  requester_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  addressee_id: string;

  @Prop({
    type: String,
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
    index: true,
  })
  status: FriendshipStatus;

  created_at: Date;
  updated_at: Date;
}

export type FriendshipDocument = HydratedDocument<Friendship>;
export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index({ requester_id: 1, addressee_id: 1 }, { unique: true });

FriendshipSchema.index({ addressee_id: 1, status: 1 });

FriendshipSchema.index({ requester_id: 1, status: 1 });
