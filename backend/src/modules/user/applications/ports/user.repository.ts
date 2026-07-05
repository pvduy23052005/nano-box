import { UserEntity } from '../../domain /user.entity';

export abstract class UserRepositoryAdapter {
  abstract save(user: UserEntity): Promise<UserEntity>;
}
