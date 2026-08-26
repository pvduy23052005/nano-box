import { LoginResponse } from '../dto/login.type';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { IpasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { ITokenGenerator } from '../ports/token-generator.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class LoginGoogleUseCase {
  private client: OAuth2Client;

  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IpasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async execute(idToken: string): Promise<LoginResponse> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new DomainValidationException({
        token: 'Không thể lấy thông tin email từ Google',
      });
    }

    let user = await this.userRepository.findByEmail(payload.email || '');

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.passwordHasher.hash(randomPassword);
      const newUser = UserEntity.create({
        email: payload.email || '',
        name: payload.name || 'Google User',
        password: hashedPassword,
        avatar: payload.picture || '',
      });
      user = await this.userRepository.save(newUser);
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
