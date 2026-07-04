import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  @Query(() => String, { name: 'me' })
  me(): string {
    return 'Hello';
  }
}
