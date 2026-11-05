import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class AddEmojiMessageInput {
  @Field(() => String)
  @IsString({ message: 'ID tin nhắn phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID tin nhắn không được để trống' })
  messageId: string;

  @Field(() => String)
  @IsString({ message: 'Emoji phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Emoji không được để trống' })
  @MaxLength(16, { message: 'Emoji không được vượt quá 16 ký tự' })
  emoji: string;

  @Field({
    nullable: true,
    description:
      'Không dùng nữa. Hệ thống tự động lấy danh tính từ phiên đăng nhập.',
  })
  @IsString({ message: 'Tên người dùng phải là chuỗi ký tự' })
  @IsOptional()
  userName?: string;

  @Field({
    nullable: true,
    description:
      'Không dùng nữa. Hệ thống tự động lấy danh tính từ phiên đăng nhập.',
  })
  @IsString({ message: 'Avatar người dùng phải là chuỗi ký tự' })
  @IsOptional()
  userAvatar?: string;
}
