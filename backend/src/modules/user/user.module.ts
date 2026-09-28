import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IpasswordHasher } from './applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from './applications/ports/user.port';
import { GetMeUseCase } from './applications/use-case/get-me.use-case';
import { GetUsersUseCase } from './applications/use-case/get-users.use-case';
import { RegisterUseCase } from './applications/use-case/register.use-case';
import { UpdateProfileUseCase } from './applications/use-case/update-profile.use-case';
import { UserRepository } from './infrastructure/databases/user.repository';
import { User, UserSchema } from './infrastructure/databases/user.schema';
import { PasswordHasher } from './infrastructure/externals/password-hasher.external';
import { UserResolver } from './presentation/graphql/user.resolver';

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
    {
      provide: GetMeUseCase,
      useFactory: (userRepository: UserRepositoryAdapter) =>
        new GetMeUseCase(userRepository),
      inject: [UserRepositoryAdapter],
    },
    {
      provide: GetUsersUseCase,
      useFactory: (userRepository: UserRepositoryAdapter) =>
        new GetUsersUseCase(userRepository),
      inject: [UserRepositoryAdapter],
    },
    {
      provide: UpdateProfileUseCase,
      useFactory: (userRepository: UserRepositoryAdapter) =>
        new UpdateProfileUseCase(userRepository),
      inject: [UserRepositoryAdapter],
    },
  ],
  exports: [
    MongooseModule,
    RegisterUseCase,
    UserRepositoryAdapter,
    IpasswordHasher,
    GetMeUseCase,
    UpdateProfileUseCase,
  ],
})
export class UserModule {}
