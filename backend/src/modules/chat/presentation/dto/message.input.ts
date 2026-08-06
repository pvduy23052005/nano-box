import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class MessageInput {
  @Field()
  @IsNotEmpty()
  content: string;
}
