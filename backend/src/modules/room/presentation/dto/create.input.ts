import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateRoomNotFriendInput {
  @Field()
  @IsString()
  otherUserId: string;
}
