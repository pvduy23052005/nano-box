import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'users',
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
