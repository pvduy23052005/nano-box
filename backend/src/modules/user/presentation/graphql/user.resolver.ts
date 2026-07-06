import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { RegisterInputDto } from '../dto/register.input';
import { RegisterPayload } from '../dto/register.payload';
import { RegisterUseCase } from '../../applications/use-case/register.use-case';
import { UserProfilePayload } from '../dto/profile.payload';
import { GetMeUseCase } from '../../applications/use-case/get-me.use-case';
import { CurrentUser } from 'src/common/customs/current-user.decorator';

@Resolver(() => RegisterPayload)
export class UserResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Query(() => UserProfilePayload)
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return await this.getMeUseCase.execute(userId);
  }

  @Mutation(() => RegisterPayload)
  register(@Args('input') input: RegisterInputDto) {
    return this.registerUseCase.execute(input);
  }
}
