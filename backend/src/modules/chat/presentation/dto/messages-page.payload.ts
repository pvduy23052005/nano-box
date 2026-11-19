import { Field, ObjectType } from '@nestjs/graphql';
import { ChatPayload } from './chat.ouput';

@ObjectType()
export class MessagesPagePayload {
  @Field(() => [ChatPayload])
  items: ChatPayload[];

  @Field(() => String, { nullable: true })
  nextCursor: string | null;

  @Field()
  hasMore: boolean;
}
