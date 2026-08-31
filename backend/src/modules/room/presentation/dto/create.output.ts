import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RoomType, MemberRole, MemberStatus } from '../../domain/chat.enum';

registerEnumType(RoomType, { name: 'RoomType' });
registerEnumType(MemberRole, { name: 'MemberRole' });
registerEnumType(MemberStatus, { name: 'MemberStatus' });

@ObjectType()
export class RoomMemberOutput {
  @Field()
  userId: string;

  @Field(() => MemberRole)
  role: MemberRole;

  @Field(() => MemberStatus)
  status: MemberStatus;
}

@ObjectType()
export class CreateRoomNotFriendOutput {
  @Field()
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => RoomType)
  typeRoom: RoomType;

  @Field(() => String, { nullable: true })
  lastMessageId: string | null;

  @Field(() => [RoomMemberOutput], { nullable: true })
  members: RoomMemberOutput[];

  @Field(() => String, { nullable: true })
  avatar: string | null;
}
