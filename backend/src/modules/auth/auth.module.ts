import { Global, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IPasswordHasher } from '../user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from '../user/applications/ports/user.port';
import { ITokenGenerator } from './applications/ports/token-generator.port';
import { IGoogleAuthVerifier } from './applications/ports/google-auth-verifier.port';
import { LoginUseCase } from './applications/use-case/login.use-case';
import { LoginGoogleUseCase } from './applications/use-case/login-google.use-case';
import { GoogleAuthVerifier } from './infrastructure/externals/google-auth-verifier.external';
import { JwtTokenGenerator } from './infrastructure/externals/jwt-token-generator.external';
import { AuthResolver } from './presentation/graphql/auth.resolver';

@Global()
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
            '30d',
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
      provide: IGoogleAuthVerifier,
      useClass: GoogleAuthVerifier,
    },
    {
      provide: LoginUseCase,
      useFactory: (
        userRepository: UserRepositoryAdapter,
        passwordHasher: IPasswordHasher,
        tokenGenerator: ITokenGenerator,
      ) => new LoginUseCase(userRepository, passwordHasher, tokenGenerator),
      inject: [UserRepositoryAdapter, IPasswordHasher, ITokenGenerator],
    },
    {
      provide: LoginGoogleUseCase,
      useFactory: (
        userRepository: UserRepositoryAdapter,
        passwordHasher: IPasswordHasher,
        tokenGenerator: ITokenGenerator,
        googleAuthVerifier: IGoogleAuthVerifier,
      ) =>
        new LoginGoogleUseCase(
          userRepository,
          passwordHasher,
          tokenGenerator,
          googleAuthVerifier,
        ),
      inject: [
        UserRepositoryAdapter,
        IPasswordHasher,
        ITokenGenerator,
        IGoogleAuthVerifier,
      ],
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
