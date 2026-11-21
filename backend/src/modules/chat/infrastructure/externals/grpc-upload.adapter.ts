import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { UploadAdapter } from '../../application/ports/upload.port';

interface UploadGrpcService {
  copyTempToUploads(data: {
    tempKey: string;
    temp_key?: string;
  }): Observable<{ url: string }>;
  validateTempKey(data: {
    tempKey: string;
    temp_key?: string;
  }): Observable<{ isValid: boolean; is_valid?: boolean }>;
  deleteTempFile(data: {
    tempKey: string;
    temp_key?: string;
  }): Observable<{ success: boolean }>;
}

@Injectable()
export class GrpcUploadAdapter implements UploadAdapter, OnModuleInit {
  private readonly logger = new Logger(GrpcUploadAdapter.name);
  private uploadGrpcService: UploadGrpcService;

  constructor(
    @Inject('UPLOAD_GRPC_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.uploadGrpcService =
      this.client.getService<UploadGrpcService>('UploadGrpcService');
  }

  async copyTempToUploads(tempKey: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.uploadGrpcService.copyTempToUploads({
          tempKey,
          temp_key: tempKey,
        }),
      );
      return response.url;
    } catch (error) {
      this.logger.error(
        `gRPC copyTempToUploads thất bại cho key ${tempKey}:`,
        error,
      );
      throw error;
    }
  }

  async validateTempKey(tempKey: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.uploadGrpcService.validateTempKey({
          tempKey,
          temp_key: tempKey,
        }),
      );
      return response.isValid ?? response.is_valid ?? false;
    } catch (error) {
      this.logger.error(
        `gRPC validateTempKey thất bại cho key ${tempKey}:`,
        error,
      );
      return false;
    }
  }

  async deleteTempFile(tempKey: string): Promise<void> {
    try {
      await firstValueFrom(
        this.uploadGrpcService.deleteTempFile({
          tempKey,
          temp_key: tempKey,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `gRPC deleteTempFile thất bại cho key ${tempKey}:`,
        error,
      );
    }
  }

  upload(): Promise<string> {
    throw new Error(
      'Upload file trực tiếp chỉ được thực hiện qua HTTP API của Upload Service',
    );
  }
}
