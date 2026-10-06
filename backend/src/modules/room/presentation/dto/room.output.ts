import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RoomType, MemberRole, MemberStatus } from '../../domain/chat.enum';

registerEnumType(RoomType, { name: 'RoomType' });
registerEnumType(MemberRole, { name: 'MemberRole' });
registerEnumType(MemberStatus, { name: 'MemberStatus' });

@ObjectType()
export class RoomMemberUserOutput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  avatar: string;
}

@ObjectType()
export class RoomMemberOutput {
  @Field()
  userId: string;

  @Field(() => MemberRole)
  role: MemberRole;

  @Field(() => MemberStatus)
  status: MemberStatus;

  @Field(() => String, { nullable: true })
  lastReadMessageId?: string | null;

  @Field(() => RoomMemberUserOutput, { nullable: true })
  user?: RoomMemberUserOutput;
}

@ObjectType()
export class LastMessageOutput {
  @Field(() => String, { nullable: true })
  id?: string | null;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => String, { nullable: true })
  senderId?: string | null;
}

@ObjectType()
export class RoomOutput {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => RoomType)
  typeRoom: RoomType;

  @Field(() => LastMessageOutput, { nullable: true })
  lastMessageId?: LastMessageOutput | null;

  @Field(() => [RoomMemberOutput], { nullable: true })
  members: RoomMemberOutput[];

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => [String], { nullable: 'itemsAndList' })
  groupAvatars?: string[] | null;
}
