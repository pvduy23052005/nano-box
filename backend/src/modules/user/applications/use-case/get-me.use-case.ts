import { UserProfile } from '../dto/user.dto';
import { UserRepositoryAdapter } from '../ports/user.port';

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepositoryAdapter) {}

  async execute(id: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    return {
      id: user?.getId() || '',
      name: user.getName(),
      email: user.getEmail(),
      avatar: user.getAvatar(),
    };
  }
}
