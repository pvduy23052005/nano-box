import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BasePayload } from 'src/common/customs/base.payload';
import { FriendshipStatus } from '../../domain/friendship.type';

registerEnumType(FriendshipStatus, {
  name: 'FriendshipStatus',
  description: 'Trạng thái mối quan hệ bạn bè',
});

@ObjectType()
export class FriendshipDataPayload {
  @Field(() => String)
  id: string;

  @Field(() => String)
  requesterId: string;

  @Field(() => String)
  addresseeId: string;

  @Field(() => FriendshipStatus)
  status: FriendshipStatus;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class SendFriendRequestPayload extends BasePayload(
  FriendshipDataPayload,
) {}

@ObjectType()
export class CancelFriendRequestPayload extends BasePayload(
  FriendshipDataPayload,
) {}

@ObjectType()
export class FriendSenderPayload {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}

@ObjectType()
export class GetReceivedFriendRequestPayload {
  @Field(() => String)
  id: string;

  @Field(() => FriendSenderPayload)
  sender: FriendSenderPayload;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
