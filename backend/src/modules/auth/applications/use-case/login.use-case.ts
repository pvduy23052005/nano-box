import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { LoginResponse, LoginRequest } from '../dto/login.type';
import { ITokenGenerator } from '../ports/token-generator.port';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';

const DUMMY_PASSWORD_HASH =
  '$2b$10$yrsSJCLiQMTKduqz0zEgr.40LXUHn2XuNZYW3.tl7xZOA9GkooAfe';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    const passwordHash = user?.getPassword() || DUMMY_PASSWORD_HASH;
    const isValid = await this.passwordHasher.compare(
      input.password,
      passwordHash,
    );
    if (!isValid || !user) {
      throw new DomainValidationException({
        email: 'Email hoặc mật khẩu không chính xác',
        password: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const accessToken = this.tokenGenerator.generateToken({
      id: user.getId() || '',
      email: user.getEmail(),
    });

    return {
      accessToken,
      user: {
        id: user.getId() || '',
        name: user.getName() || '',
        email: user.getEmail(),
      },
    };
  }
}
