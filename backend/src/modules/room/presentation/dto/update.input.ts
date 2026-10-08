import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateRoomProfileInput {
  @Field(() => String)
  @IsMongoId({ message: 'ID phòng không hợp lệ' })
  roomId: string;

  @Field(() => String)
  @IsString({ message: 'Tên phòng phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên phòng tối đa 100 ký tự' })
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi ký tự' })
  avatar?: string;
}
