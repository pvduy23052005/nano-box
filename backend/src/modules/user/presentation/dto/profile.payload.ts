import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfile } from '../../applications/dto/user.dto';

@ObjectType()
export class UserProfilePayload implements UserProfile {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  avatar: string;
}
