import { Logger } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { extractClientIp } from 'src/common/utils/client-ip.util';
import { LoginGoogleUseCase } from '../../applications/use-case/login-google.use-case';
import { LoginUseCase } from '../../applications/use-case/login.use-case';
import { AuthAuditAction } from '../constants/auth-audit.constant';
import { LoginInputDto } from '../dto/login.input';
import { LoginPayload } from '../dto/login.payload';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginGoogleUseCase: LoginGoogleUseCase,
  ) {}

  @Mutation(() => LoginPayload)
  async login(
    @Args('input') input: LoginInputDto,
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<LoginPayload> {
    const result = await this.loginUseCase.execute(input);

    this.setAccessTokenCookie(res, result.accessToken);
    this.logSuccessfulLogin(req, result.user, AuthAuditAction.LOGIN_SUCCESS);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @Mutation(() => LoginPayload)
  async loginGoogle(
    @Args('idToken') idToken: string,
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<LoginPayload> {
    const result = await this.loginGoogleUseCase.execute(idToken);

    this.setAccessTokenCookie(res, result.accessToken);
    this.logSuccessfulLogin(
      req,
      result.user,
      AuthAuditAction.LOGIN_GOOGLE_SUCCESS,
    );

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @Mutation(() => Boolean)
  logout(@Context('req') req: Request, @Context('res') res: Response): boolean {
    this.clearAccessTokenCookie(res);
    this.logSuccessfulLogout(req);
    return true;
  }

  private setAccessTokenCookie(res: Response, token: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: THIRTY_DAYS_IN_MS,
    });
  }

  private clearAccessTokenCookie(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }

  private logSuccessfulLogin(
    req: Request,
    user: { id: string; email: string },
    action: AuthAuditAction,
  ): void {
    const ip = extractClientIp(req);
    const userAgent = req.headers['user-agent'];

    this.logger.log(
      {
        action,
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
      },
      `[Auth] User ${user.email} (${user.id}) logged in successfully`,
    );
  }

  private logSuccessfulLogout(req: Request): void {
    const ip = extractClientIp(req);
    const userAgent = req.headers['user-agent'];

    this.logger.log(
      {
        action: AuthAuditAction.LOGOUT_SUCCESS,
        ip,
        userAgent,
      },
      '[Auth] User logged out successfully',
    );
  }
}
