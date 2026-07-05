import { UserEntity } from '../../domain/user.entity';
import { RegisterInputDto } from '../../presentation/dto/register.input';
import type { UserRepositoryAdapter } from '../ports/user.port';
import { IpasswordHasher } from '../ports/password-hasher.port';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepositoryAdapter,
    private readonly passwordHasher: IpasswordHasher,
  ) { }

  async execute(input: RegisterInputDto): Promise<UserEntity> {
    const existUser = await this.userRepository.findByEmail(input.email);

    if (existUser) {
      throw new Error('Email đã tồn tại');
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);
    const user = UserEntity.create({
      ...input,
      password: hashedPassword,
    });

    const savedUsser = await this.userRepository.save(user);

    return savedUsser;
  }
}
