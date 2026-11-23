import * as crypto from 'crypto';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserStatus } from 'src/modules/user/domain/user.type';
import { LoginResponse } from '../dto/login.type';
import { IGoogleAuthVerifier } from '../ports/google-auth-verifier.port';
import { ITokenGenerator } from '../ports/token-generator.port';

export class LoginGoogleUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly googleAuthVerifier: IGoogleAuthVerifier,
  ) {}

  async execute(idToken: string): Promise<LoginResponse> {
    const payload = await this.googleAuthVerifier.verify(idToken);

    if (!payload || !payload.email) {
      throw new DomainValidationException({
        token: 'Không thể lấy thông tin email từ Google',
      });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (user) {
      if (user.getStatus() !== UserStatus.ACTIVE) {
        throw new DomainValidationException({
          token: 'Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt',
        });
      }
    } else {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.passwordHasher.hash(randomPassword);
      const newUser = UserEntity.create({
        email: normalizedEmail,
        name: payload.name || 'Google User',
        password: hashedPassword,
        avatar: payload.picture ?? '',
      });
      user = await this.userRepository.save(newUser);
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
        name: user.getName(),
        email: user.getEmail(),
      },
    };
  }
}
