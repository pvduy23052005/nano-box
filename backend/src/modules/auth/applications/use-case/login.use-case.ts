import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { UserStatus } from 'src/modules/user/domain/user.type';
import { LoginRequest, LoginResponse } from '../dto/login.type';
import { ITokenGenerator } from '../ports/token-generator.port';

const DUMMY_PASSWORD_HASH =
  '$2b$10$yrsSJCLiQMTKduqz0zEgr.40LXUHn2XuNZYW3.tl7xZOA9GkooAfe';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    const userPassword = user?.getPassword();

    if (!user || !userPassword) {
      await this.passwordHasher.compare(input.password, DUMMY_PASSWORD_HASH);
      throw new DomainValidationException({
        email: 'Email hoặc mật khẩu không chính xác',
        password: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const isValid = await this.passwordHasher.compare(
      input.password,
      userPassword,
    );
    if (!isValid) {
      throw new DomainValidationException({
        email: 'Email hoặc mật khẩu không chính xác',
        password: 'Email hoặc mật khẩu không chính xác',
      });
    }

    if (user.getStatus() !== UserStatus.ACTIVE) {
      throw new DomainValidationException({
        email: 'Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt',
      });
    }

    const userId = user.getId() || '';
    const accessToken = this.tokenGenerator.generateToken({
      id: userId,
      email: user.getEmail(),
    });

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
