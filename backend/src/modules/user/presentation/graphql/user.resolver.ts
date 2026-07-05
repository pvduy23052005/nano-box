import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { RegisterInputDto } from '../dto/register.input';
import { RegisterPayload } from '../dto/register.payload';
import { RegisterUseCase } from '../../applications/use-case/register.use-case';

@Resolver(() => RegisterPayload)
export class UserResolver {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => RegisterPayload)
  register(@Args('input') input: RegisterInputDto) {
    return this.registerUseCase.execute(input);
  }
}
