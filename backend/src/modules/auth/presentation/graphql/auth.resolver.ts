import { LoginInputDto } from '../dto/login.input';
import { LoginPayload } from '../dto/login.payload';
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { LoginUseCase } from '../../applications/use-case/login.use-case';
import type { Response } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Mutation(() => LoginPayload)
  async login(
    @Args('input') input: LoginInputDto,
    @Context('res') res: Response,
  ): Promise<LoginPayload> {
    const result = await this.loginUseCase.execute(input);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }
}
