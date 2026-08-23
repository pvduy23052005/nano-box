import { Field, ObjectType } from '@nestjs/graphql';
import { ChatPayload } from './chat.payload';

@ObjectType()
export class MessagesPagePayload {
  @Field(() => [ChatPayload])
  items: ChatPayload[];

  @Field(() => String, { nullable: true })
  nextCursor: string | null;

  @Field()
  hasMore: boolean;
}
