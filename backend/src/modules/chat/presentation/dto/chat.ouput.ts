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

  @Field(() => String)
  roomId: string;

  @Field(() => [String], { nullable: true })
  attachments: string[];

  @Field(() => [String], { nullable: true })
  readBy: string[];

  @Field(() => [ReactionPayload], { nullable: true, defaultValue: [] })
  reactions?: ReactionPayload[];
}
