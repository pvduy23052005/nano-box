import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/customs/current-user.decorator';
import { GetMeUseCase } from '../../applications/use-case/get-me.use-case';
import { GetUsersUseCase } from '../../applications/use-case/get-users.use-case';
import { RegisterUseCase } from '../../applications/use-case/register.use-case';
import { UpdateProfileUseCase } from '../../applications/use-case/update-profile.use-case';
import { UserProfilePayload } from '../dto/profile.payload';
import { RegisterInputDto } from '../dto/register.input';
import { RegisterPayload } from '../dto/register.payload';
import { UpdateProfileInputDto } from '../dto/update-profile.input';
import { UpdateProfilePayload } from '../dto/update-profile.payload';

@Resolver(() => RegisterPayload)
export class UserResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
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

  @Mutation(() => UpdateProfilePayload)
  @UseGuards(AuthGuard)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateProfileInputDto,
  ): Promise<UpdateProfilePayload> {
    const result = await this.updateProfileUseCase.execute(userId, input);

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: result,
    };
  }
}

