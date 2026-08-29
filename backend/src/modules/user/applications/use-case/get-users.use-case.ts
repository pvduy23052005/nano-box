import { UserProfile } from '../../applications/dto/user.dto';
import { UserRepositoryAdapter } from '../ports/user.port';

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryAdapter) {}

  async execute(search?: string): Promise<UserProfile[]> {
    const users = await this.userRepository.findAll(search);
    return users.map((user) => ({
      id: user.getId() || '',
      name: user.getName(),
      email: user.getEmail(),
      avatar: user.getAvatar(),
    }));
  }
}
