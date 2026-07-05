import { UserEntity } from "../../domain /user.entity";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity>;
}