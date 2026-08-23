import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatPayload {
  @Field(() => String)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  senderId: string;

  @Field(() => [String], { nullable: true })
  attachments: string[];

  @Field(() => [String], { nullable: true })
  readBy: string[];
}
