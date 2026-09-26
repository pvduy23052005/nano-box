import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddEmojiMessageInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'ID tin nhắn không được để trống' })
  messageId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Emoji không được để trống' })
  emoji: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userAvatar?: string;
}
