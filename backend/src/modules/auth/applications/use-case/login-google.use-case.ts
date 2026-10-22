import { LoginResponse } from '../dto/login.type';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { ITokenGenerator } from '../ports/token-generator.port';
import { IGoogleAuthVerifier } from '../ports/google-auth-verifier.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import * as crypto from 'crypto';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { ILogger } from 'src/common/ports/logger.port';
import { LoginLogAction, LoginFailureReason } from '../logs/login.log';

export class LoginGoogleUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly googleAuthVerifier: IGoogleAuthVerifier,
    private readonly logger: ILogger,
  ) {}

  async execute(idToken: string): Promise<LoginResponse> {
    const payload = await this.googleAuthVerifier.verify(idToken);

    if (!payload || !payload.email) {
      this.logger.warn(
        {
          action: LoginLogAction.LOGIN_GOOGLE_FAILED,
          reason: LoginFailureReason.INVALID_GOOGLE_TOKEN,
        },
        'Đăng nhập Google thất bại: thông tin xác thực không chính xác',
      );

      throw new DomainValidationException({
        token: 'Không thể lấy thông tin email từ Google',
      });
    }

    let user = await this.userRepository.findByEmail(payload.email || '');
    let isNewUser = false;

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.passwordHasher.hash(randomPassword);
      const newUser = UserEntity.create({
        email: payload.email || '',
        name: payload.name || 'Google User',
        password: hashedPassword,
        avatar: payload.picture ?? '',
      });
      user = await this.userRepository.save(newUser);
      isNewUser = true;

      this.logger.info(
        {
          action: LoginLogAction.GOOGLE_USER_REGISTERED,
          userId: user.getId(),
          email: user.getEmail(),
        },
        'Tự động đăng ký tài khoản mới qua Google OAuth',
      );
    }

    const userId = user.getId() || '';
    const accessToken = this.tokenGenerator.generateToken({
      id: userId,
      email: user.getEmail(),
    });

    this.logger.info(
      {
        action: LoginLogAction.LOGIN_GOOGLE_SUCCESS,
        userId,
        email: user.getEmail(),
        isNewUser,
      },
      'Người dùng đăng nhập thành công qua Google',
    );

    return {
      accessToken,
      user: {
        id: userId,
        name: user.getName(),
        email: user.getEmail(),
      },
    };
  }
}
