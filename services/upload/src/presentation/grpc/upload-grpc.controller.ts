import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UploadAdapter } from '../../applications/ports/upload.port';

interface CopyTempRequest {
  tempKey?: string;
  temp_key?: string;
}

interface CopyTempResponse {
  url: string;
}

interface ValidateTempKeyRequest {
  tempKey?: string;
  temp_key?: string;
}

interface ValidateTempKeyResponse {
  isValid: boolean;
  is_valid: boolean;
}

interface DeleteTempFileRequest {
  tempKey?: string;
  temp_key?: string;
}

interface DeleteTempFileResponse {
  success: boolean;
}

@Controller()
export class UploadGrpcController {
  private readonly logger = new Logger(UploadGrpcController.name);

  constructor(private readonly uploadAdapter: UploadAdapter) {}

  @GrpcMethod('UploadGrpcService', 'CopyTempToUploads')
  async copyTempToUploads(data: CopyTempRequest): Promise<CopyTempResponse> {
    const key = data.tempKey || data.temp_key || '';
    this.logger.log(`gRPC CopyTempToUploads received for key: ${key}`);
    const url = await this.uploadAdapter.copyTempToUploads(key);
    return { url };
  }

  @GrpcMethod('UploadGrpcService', 'ValidateTempKey')
  async validateTempKey(
    data: ValidateTempKeyRequest,
  ): Promise<ValidateTempKeyResponse> {
    const key = data.tempKey || data.temp_key || '';
    const isValid = await this.uploadAdapter.validateTempKey(key);
    return { isValid, is_valid: isValid };
  }

  @GrpcMethod('UploadGrpcService', 'DeleteTempFile')
  async deleteTempFile(
    data: DeleteTempFileRequest,
  ): Promise<DeleteTempFileResponse> {
    const key = data.tempKey || data.temp_key || '';
    this.logger.log(`gRPC DeleteTempFile received for key: ${key}`);
    await this.uploadAdapter.deleteTempFile(key);
    return { success: true };
  }
}
