import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

@InputType()
export class MessageInput {
  @Field(() => String)
  @IsString({ message: 'ID phòng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID phòng không được để trống' })
  roomId: string;

  @Field({ nullable: true })
  @IsString({ message: 'Nội dung tin nhắn phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(5000, {
    message: 'Nội dung tin nhắn không được vượt quá 5000 ký tự',
  })
  content: string;

  @Field({
    nullable: true,
    description:
      'Không dùng nữa. Hệ thống tự động lấy danh tính từ phiên đăng nhập.',
  })
  @IsString({ message: 'Tên người gửi phải là chuỗi ký tự' })
  @IsOptional()
  senderName?: string;

  @Field({
    nullable: true,
    description:
      'Không dùng nữa. Hệ thống tự động lấy danh tính từ phiên đăng nhập.',
  })
  @IsString({ message: 'Avatar người gửi phải là chuỗi ký tự' })
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
