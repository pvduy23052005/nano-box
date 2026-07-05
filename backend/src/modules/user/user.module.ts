import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserResolver } from './presentation/graphql/user.resolver';
import { RegisterUseCase } from './applications/use-case/register.use-case';
import { UserRepositoryAdapter } from './applications/ports/user.repository';
import {
  User,
  UserSchema,
} from './infrastructure/databases/schemas/user.schema';
import { UserRepository } from './infrastructure/databases/repositories/user.repository';

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
      provide: RegisterUseCase,
      useFactory: (userRepository: UserRepositoryAdapter) =>
        new RegisterUseCase(userRepository),
      inject: [UserRepositoryAdapter],
    },
  ],
  exports: [RegisterUseCase],
})
export class UserModule {}
