import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class RevokeRoomAdminInput {
  @Field(() => String)
  @IsMongoId({ message: 'ID phòng không hợp lệ' })
  roomId: string;

  @Field(() => String)
  @IsMongoId({ message: 'ID người dùng không hợp lệ' })
  userId: string;
}
