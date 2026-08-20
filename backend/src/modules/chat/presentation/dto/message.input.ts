import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class MessageInput {
  @Field({ defaultValue: '' })
  @IsString()
  @IsOptional()
  content: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tempKeys?: string[];
}
