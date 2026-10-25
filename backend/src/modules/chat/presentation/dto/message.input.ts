import { Field, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class MessageInput {
  @Field(() => String)
  @IsString()
  roomId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  senderName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  senderAvatar?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(10, {
    message: 'Chỉ được gửi tối đa 10 file đính kèm mỗi tin nhắn',
  })
  @Matches(/^temp\/[a-z0-9-]+(\.[a-z0-9]+)?$/i, {
    each: true,
    message: 'Định dạng tempKey không hợp lệ',
  })
  tempKeys?: string[];
}
