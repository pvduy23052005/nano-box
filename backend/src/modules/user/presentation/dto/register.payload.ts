import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RegisterPayload {
  @Field()
  name: string;

  @Field()
  email: string;
}
