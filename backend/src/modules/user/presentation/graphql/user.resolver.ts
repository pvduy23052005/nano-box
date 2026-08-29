import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { RegisterInputDto } from '../dto/register.input';
import { RegisterPayload } from '../dto/register.payload';
import { RegisterUseCase } from '../../applications/use-case/register.use-case';
import { UserProfilePayload } from '../dto/profile.payload';
import { GetMeUseCase } from '../../applications/use-case/get-me.use-case';
import { GetUsersUseCase } from '../../applications/use-case/get-users.use-case';
import { CurrentUser } from 'src/common/customs/current-user.decorator';

@Resolver(() => RegisterPayload)
export class UserResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
  ) {}

  @Query(() => UserProfilePayload)
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return await this.getMeUseCase.execute(userId);
  }

  @Query(() => [UserProfilePayload])
  @UseGuards(AuthGuard)
  async getUsers(@Args('search', { nullable: true }) search?: string) {
    return await this.getUsersUseCase.execute(search);
  }

  @Mutation(() => RegisterPayload)
  async register(@Args('input') input: RegisterInputDto) {
    const result = await this.registerUseCase.execute(input);
    return {
      success: true,
      message: 'Đăng ký thành công',
      data: result,
    };
  }
}
