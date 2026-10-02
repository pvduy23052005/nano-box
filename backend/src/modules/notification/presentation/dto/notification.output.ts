import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '../../domain/notification.type';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
export class NotificationMetadataOutput {
  @Field({ nullable: true })
  roomId?: string;

  @Field({ nullable: true })
  messageId?: string;
}

@ObjectType()
export class NotificationPayload {
  @Field(() => ID)
  id: string;

  @Field()
  recipientId: string;

  @Field()
  senderId: string;

  @Field({ nullable: true })
  senderName?: string;

  @Field({ nullable: true })
  senderAvatar?: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => NotificationMetadataOutput)
  metadata: NotificationMetadataOutput;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class NotificationsPagePayload {
  @Field(() => [NotificationPayload])
  items: NotificationPayload[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore: boolean;

  @Field(() => Int)
  unreadCount: number;
}
