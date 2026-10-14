import { UserEntity } from '../../domain/user.entity';

export abstract class UserRepositoryAdapter {
  abstract save(user: UserEntity): Promise<UserEntity>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findAll(search?: string, limit?: number): Promise<UserEntity[]>;
}
