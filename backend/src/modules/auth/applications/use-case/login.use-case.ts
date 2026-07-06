import { LoginResponse, LoginRequest } from '../dto/login.type';
import { ITokenGenerator } from '../ports/token-generator.port';
import { IpasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IpasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);

    const isValid = await this.passwordHasher.compare(
      input.password,
      user?.getPassword() || '',
    );
    if (!isValid || !user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const accessToken = this.tokenGenerator.generateToken({
      id: user.getId() || '',
      email: user.getEmail(),
    });

    return {
      accessToken,
      user: {
        id: user.getId() || '',
        email: user.getEmail(),
      },
    };
  }
}
