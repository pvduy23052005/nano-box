import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;
}

@ObjectType()
export class LoginPayload {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}
