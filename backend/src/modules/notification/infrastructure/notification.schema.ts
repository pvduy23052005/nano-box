import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationType } from '../domain/notification.type';

@Schema({ _id: false })
export class NotificationMetadataSchema {
  @Prop({ required: true })
  room_id: string;

  @Prop()
  message_id?: string;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'notifications',
})
export class Notification {
  @Prop({ required: true, trim: true, index: true })
  recipient_id: string;

  @Prop({ required: true, trim: true })
  sender_id: string;

  @Prop({ trim: true })
  sender_name?: string;

  @Prop({ trim: true })
  sender_avatar?: string;

  @Prop({
    required: true,
    enum: NotificationType,
  })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: NotificationMetadataSchema, required: true })
  metadata: NotificationMetadataSchema;

  @Prop({ default: false, index: true })
  is_read: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipient_id: 1, created_at: -1 });

NotificationSchema.index({ recipient_id: 1, is_read: 1 });
