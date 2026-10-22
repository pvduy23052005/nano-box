import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { LoginResponse, LoginRequest } from '../dto/login.type';
import { ITokenGenerator } from '../ports/token-generator.port';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { ILogger } from 'src/common/ports/logger.port';
import { LoginLogAction, LoginFailureReason } from '../logs/login.log';

const DUMMY_PASSWORD_HASH =
  '$2b$10$yrsSJCLiQMTKduqz0zEgr.40LXUHn2XuNZYW3.tl7xZOA9GkooAfe';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly logger: ILogger,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    const passwordHash = user?.getPassword() || DUMMY_PASSWORD_HASH;
    const isValid = await this.passwordHasher.compare(
      input.password,
      passwordHash,
    );
    if (!isValid || !user) {
      this.logger.warn(
        {
          action: LoginLogAction.LOGIN_FAILED,
          email: input.email,
          reason: !user
            ? LoginFailureReason.USER_NOT_FOUND
            : LoginFailureReason.INVALID_PASSWORD,
        },
        'Đăng nhập thất bại: thông tin xác thực không chính xác',
      );

      throw new DomainValidationException({
        email: 'Email hoặc mật khẩu không chính xác',
        password: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const userId = user.getId() || '';
    const accessToken = this.tokenGenerator.generateToken({
      id: userId,
      email: user.getEmail(),
    });

    this.logger.info(
      {
        action: LoginLogAction.LOGIN_SUCCESS,
        userId,
        email: user.getEmail(),
      },
      'Người dùng đăng nhập thành công',
    );

    return {
      accessToken,
      user: {
        id: userId,
        name: user.getName() || '',
        email: user.getEmail(),
      },
    };
  }
}
