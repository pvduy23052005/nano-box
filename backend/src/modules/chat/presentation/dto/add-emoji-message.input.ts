import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

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
}
