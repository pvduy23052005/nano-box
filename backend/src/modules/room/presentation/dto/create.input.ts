import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateRoomNotFriendInput {
  @Field()
  @IsString()
  otherUserId: string;
}

@InputType()
export class CreateGroupRoomInput {
  @Field()
  @IsString({ message: 'Tên nhóm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MaxLength(100, { message: 'Tên nhóm tối đa 100 ký tự' })
  title: string;

  @Field(() => [String])
  @IsArray({ message: 'Danh sách thành viên phải là một mảng' })
  @ArrayMinSize(2, { message: 'Vui lòng chọn ít nhất 2 thành viên' })
  @ArrayMaxSize(100, { message: 'Nhóm tối đa 100 thành viên' })
  @IsMongoId({ each: true, message: 'ID thành viên không hợp lệ' })
  memberIds: string[];
}
