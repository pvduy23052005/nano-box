import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReactionPayload {
  @Field(() => String)
  emoji: string;

  @Field(() => [String])
  userIds: string[];
}

@ObjectType()
export class ChatPayload {
  @Field(() => String)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  senderId: string;

  @Field(() => String, { nullable: true })
  senderAvatar?: string | null;

  @Field(() => String, { nullable: true })
  senderName?: string | null;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String)
  roomId: string;

  @Field(() => [String], { nullable: true })
  attachments: string[];

  @Field(() => [String], { nullable: true })
  readBy: string[];

  @Field(() => [String], { nullable: true, defaultValue: [] })
  mentionedUserIds?: string[];

  @Field(() => [ReactionPayload], { nullable: true, defaultValue: [] })
  reactions?: ReactionPayload[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isSystem?: boolean;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;
}
