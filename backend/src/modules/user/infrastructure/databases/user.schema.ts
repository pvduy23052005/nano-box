import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserStatus } from 'src/modules/user/domain/user.type';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'users',
})
export class User {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;

  @Prop({ default: '' })
  avatar: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
