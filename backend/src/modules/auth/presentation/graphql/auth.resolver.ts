import { LoginInputDto } from '../dto/login.input';
import { LoginPayload } from '../dto/login.payload';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LoginUseCase } from '../../applications/use-case/login.use-case';

@Resolver()
export class AuthResolver {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Mutation(() => LoginPayload)
  async login(@Args('input') input: LoginInputDto): Promise<LoginPayload> {
    return this.loginUseCase.execute(input);
  }
}
