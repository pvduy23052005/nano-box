import { Module } from '@nestjs/common';
import { UploadAdapter } from './applications/ports/upload.port';
import { UploadFileUseCase } from './applications/use-case/upload-file.use-case';
import { UploadTempFileUseCase } from './applications/use-case/upload-temp-file.use-case';
import { CloudflareR2Adapter } from './infrastructure/externals/cloudflare-r2';
import { UploadController } from './presentation/rest/upload.controller';
import { UploadThrottlerGuard } from './presentation/rest/guards/upload-throttler.guard';

@Module({
  controllers: [UploadController],
  providers: [
    UploadThrottlerGuard,
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
  exports: [UploadAdapter, UploadFileUseCase, UploadTempFileUseCase],
})
export class UploadModule {}
