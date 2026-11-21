import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UploadAdapter } from './applications/ports/upload.port';
import { UploadFileUseCase } from './applications/use-case/upload-file.use-case';
import { UploadTempFileUseCase } from './applications/use-case/upload-temp-file.use-case';
import { CloudflareR2Adapter } from './infrastructure/externals/cloudflare';
import { UploadController } from './presentation/rest/upload.controller';
import { UploadGrpcController } from './presentation/grpc/upload-grpc.controller';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret_key'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController, UploadGrpcController],
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
