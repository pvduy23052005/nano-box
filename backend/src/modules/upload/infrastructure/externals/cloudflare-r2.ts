import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsClient } from 'aws4fetch';
import { UploadAdapter } from '../../applications/ports/upload.port';
import { StorageException } from '../../domain/upload.exception';

@Injectable()
export class CloudflareR2Adapter implements UploadAdapter {
  private static readonly TEMP_KEY_REGEX = /^temp\/[a-z0-9-]+(\.[a-z0-9]+)?$/i;
  private readonly logger = new Logger(CloudflareR2Adapter.name);
  private readonly awsClient: AwsClient;
  private readonly accountId: string;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const accessKeyId =
      this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'R2_SECRET_ACCESS_KEY',
    );

    this.bucketName = this.configService
      .getOrThrow<string>('R2_BUCKET_NAME')
      .replace(/"/g, '');
    this.publicUrl = this.configService
      .getOrThrow<string>('R2_PUBLIC_URL')
      .replace(/"/g, '')
      .replace(/\/+$/, '');

    this.awsClient = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region: 'auto',
    });
  }

  private get r2Endpoint(): string {
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}`;
  }

  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    contentDisposition: string,
  ): Promise<string> {
    const endpointUrl = `${this.r2Endpoint}/${key}`;

    try {
      const response = await this.awsClient.fetch(endpointUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': contentDisposition,
        },
        body: new Uint8Array(buffer),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `R2 Upload failed [${response.status}]: ${errorText}`,
        );
        throw new StorageException('Tải file lên R2 thất bại');
      }

      return `${this.publicUrl}/${key}`;
    } catch (error) {
      if (error instanceof StorageException) throw error;
      const errorObj = error as { name?: string };
      if (errorObj?.name === 'TimeoutError' || errorObj?.name === 'AbortError') {
        this.logger.error(`R2 Upload timed out for key ${key}`);
        throw new StorageException(
          'Quá thời gian tải file lên Cloudflare R2',
        );
      }
      this.logger.error(`Error uploading to R2: ${error}`);
      throw new StorageException(
        'Lỗi hệ thống khi tải file lên Cloudflare R2',
      );
    }
  }

  async validateTempKey(tempKey: string): Promise<boolean> {
    if (!tempKey || !CloudflareR2Adapter.TEMP_KEY_REGEX.test(tempKey)) {
      return false;
    }

    try {
      const response = await this.awsClient.fetch(
        `${this.r2Endpoint}/${tempKey}`,
        {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000),
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async copyTempToUploads(tempKey: string): Promise<string> {
    if (!tempKey || !CloudflareR2Adapter.TEMP_KEY_REGEX.test(tempKey)) {
      throw new StorageException('Định dạng tempKey không hợp lệ');
    }

    const filename = tempKey.replace(/^temp\//, '');
    const destKey = `uploads/${filename}`;
    const destUrl = `${this.r2Endpoint}/${destKey}`;

    try {
      const response = await this.awsClient.fetch(destUrl, {
        method: 'PUT',
        headers: {
          'x-amz-copy-source': `/${this.bucketName}/${tempKey}`,
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.status === 404) {
        throw new StorageException('File tạm không tồn tại hoặc đã hết hạn');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `R2 CopyObject failed [${response.status}]: ${errorText}`,
        );
        throw new StorageException(
          'Sao chép file từ temp sang uploads thất bại',
        );
      }

      return `${this.publicUrl}/${destKey}`;
    } catch (error) {
      if (error instanceof StorageException) throw error;
      const errorObj = error as { name?: string };
      if (errorObj?.name === 'TimeoutError' || errorObj?.name === 'AbortError') {
        this.logger.error(`R2 CopyObject timed out for key ${tempKey}`);
        throw new StorageException(
          'Quá thời gian sao chép file trên Cloudflare R2',
        );
      }
      this.logger.error(`Error copying object in R2: ${error}`);
      throw new StorageException(
        'Lỗi hệ thống khi sao chép file trên Cloudflare R2',
      );
    }
  }

  async deleteTempFile(tempKey: string): Promise<void> {
    if (!tempKey || !CloudflareR2Adapter.TEMP_KEY_REGEX.test(tempKey)) {
      return;
    }

    const deleteUrl = `${this.r2Endpoint}/${tempKey}`;

    try {
      const response = await this.awsClient.fetch(deleteUrl, {
        method: 'DELETE',
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(
          `R2 DeleteObject failed [${response.status}]: ${errorText}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Error deleting temp file from R2: ${error}`);
    }
  }
}
