import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UpdateProfileInput, UserProfile } from '../dto/user.dto';
import { UserRepositoryAdapter } from '../ports/user.port';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepositoryAdapter) {}

  async execute(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainValidationException('user', 'Người dùng không tồn tại');
    }

    user.updateProfile(input);

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.getId() || '',
      name: savedUser.getName(),
      email: savedUser.getEmail(),
      avatar: savedUser.getAvatar(),
    };
  }
}
