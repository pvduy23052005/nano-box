import { UserEntity } from '../../domain/user.entity';

export abstract class UserRepositoryAdapter {
  abstract save(user: UserEntity): Promise<UserEntity>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
