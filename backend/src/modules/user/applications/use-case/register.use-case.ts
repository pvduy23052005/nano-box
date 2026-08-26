import { UserEntity } from '../../domain/user.entity';
import { RegisterInputDto } from '../../presentation/dto/register.input';
import type { UserRepositoryAdapter } from '../ports/user.port';
import { IpasswordHasher } from '../ports/password-hasher.port';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IpasswordHasher,
  ) {}

  async execute(input: RegisterInputDto): Promise<UserEntity> {
    const errors: Record<string, string> = {};

    if (input.password != input.confirmPassword) {
      errors.password = 'Xác nhận mật khẩu không chính xác';
    }

    const existUser = await this.userRepository.findByEmail(input.email);
    if (existUser) {
      errors.email = 'Email đã tồn tại';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);
    const user = UserEntity.create({
      ...input,
      password: hashedPassword,
      avatar: '',
    });

    const savedUsser = await this.userRepository.save(user);
    return savedUsser;
  }
}
