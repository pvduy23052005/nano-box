import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { UploadAdapter } from './applications/ports/upload.port';
import { UploadFileUseCase } from './applications/use-case/upload-file.use-case';
import { UploadTempFileUseCase } from './applications/use-case/upload-temp-file.use-case';
import { AuthGuard } from './presentation/guards/auth.guard';
import { RateLimitGuard } from './presentation/guards/rate-limit.guard';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { CloudflareR2Adapter } from './infrastructure/externals/cloudflare';
import { UploadGrpcController } from './presentation/grpc/upload-grpc.controller';
import { HealthController } from './presentation/rest/health.controller';
import { UploadController } from './presentation/rest/upload.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      providers: [LoggerConfigService],
      inject: [LoggerConfigService],
      useFactory: (loggerConfigService: LoggerConfigService) =>
        loggerConfigService.createOptions(),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret_key'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController, UploadController, UploadGrpcController],
  providers: [
    AuthGuard,
    RateLimitGuard,
    {
      provide: UploadAdapter,
      useClass: CloudflareR2Adapter,
    },
    {
      provide: UploadFileUseCase,
      useFactory: (uploadAdapter: UploadAdapter) =>
        new UploadFileUseCase(uploadAdapter),
      inject: [UploadAdapter],
    },
    {
      provide: UploadTempFileUseCase,
      useFactory: (uploadFileUseCase: UploadFileUseCase) =>
        new UploadTempFileUseCase(uploadFileUseCase),
      inject: [UploadFileUseCase],
    },
  ],
})
export class AppModule {}
