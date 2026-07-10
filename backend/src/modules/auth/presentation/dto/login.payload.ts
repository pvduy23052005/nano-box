import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BasePayload } from 'src/common/customs/base.payload';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class LoginResult {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}

@ObjectType()
export class LoginPayload extends BasePayload(LoginResult) {}
