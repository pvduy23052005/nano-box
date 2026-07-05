import { UserEntity } from '../../domain /user.entity';
import { RegisterInputDto } from '../../presentation/dto/register.input';
import type { UserRepositoryAdapter } from '../ports/user.repository';

export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepositoryAdapter) {}
  async execute(input: RegisterInputDto): Promise<UserEntity> {
    const user = UserEntity.create(input);

    const savedUsser = await this.userRepository.save(user);

    return savedUsser;
  }
}
