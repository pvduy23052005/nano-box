import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IpasswordHasher } from '../user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from '../user/applications/ports/user.port';
import { ITokenGenerator } from './applications/ports/token-generator.port';
import { LoginUseCase } from './applications/use-case/login.use-case';
import { JwtTokenGenerator } from './infrastructure/externals/jwt-token-generator.external';
import { AuthResolver } from './presentation/graphql/auth.resolver';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
            'JWT_EXPIRES_IN',
          ) as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
        },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    {
      provide: ITokenGenerator,
      useClass: JwtTokenGenerator,
    },
    {
      provide: LoginUseCase,
      useFactory: (
        userRepository: UserRepositoryAdapter,
        passwordHasher: IpasswordHasher,
        tokenGenerator: ITokenGenerator,
      ) => new LoginUseCase(userRepository, passwordHasher, tokenGenerator),
      inject: [UserRepositoryAdapter, IpasswordHasher, ITokenGenerator],
    },
  ],
})
export class AuthModule {}
