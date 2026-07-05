import {
  User,
  UserSchema,
} from './infrastructure/databases/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserResolver } from './presentation/graphql/user.resolver';
import { RegisterUseCase } from './applications/use-case/register.use-case';
import { UserRepositoryAdapter } from './applications/ports/user.port';
import { IpasswordHasher } from './applications/ports/password-hasher.port';
import { UserRepository } from './infrastructure/databases/repositories/user.repository';
import { PasswordHasher } from './infrastructure/externals/password-hasher.external';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserResolver,
    {
      provide: UserRepositoryAdapter,
      useClass: UserRepository,
    },
    {
      provide: IpasswordHasher,
      useClass: PasswordHasher,
    },
    {
      provide: RegisterUseCase,
      useFactory: (
        userRepository: UserRepositoryAdapter,
        passwordHasher: IpasswordHasher,
      ) => new RegisterUseCase(userRepository, passwordHasher),
      inject: [UserRepositoryAdapter, IpasswordHasher],
    },
  ],
  exports: [RegisterUseCase],
})
export class UserModule {}
