import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsClient } from 'aws4fetch';
import * as path from 'path';
import * as crypto from 'crypto';
import 'multer';
import { UploadResponseDto } from './dto/upload-response.dto';
import { TempUploadResponseDto } from './dto/temp-upload-response.dto';
import {
  detectFileCategory,
  resolveMimeType,
  MAX_FILE_SIZE,
  ALLOWED_UPLOAD_FOLDERS,
  UploadFolder,
} from './constants/upload.constant';

@Injectable()
export class UploadService {
  private static readonly TEMP_KEY_REGEX =
    /^temp\/[a-z0-9-]+(\.[a-z0-9]+)?$/i;
  private readonly logger = new Logger(UploadService.name);
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

  async uploadFile(
    file: Express.Multer.File,
    folder: string = UploadFolder.UPLOADS,
  ): Promise<UploadResponseDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng chọn file hợp lệ để tải lên');
    }

    if (!ALLOWED_UPLOAD_FOLDERS.includes(folder)) {
      throw new BadRequestException(
        `Thư mục không hợp lệ. Chỉ cho phép: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const maxMb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `Kích thước file vượt quá giới hạn tối đa ${maxMb}MB`,
      );
    }

    const originalName = file.originalname || 'file';
    const ext = path.extname(originalName).toLowerCase();
    const cleanFolder = folder;
    const category = detectFileCategory(file.mimetype, originalName);
    const mimeType = resolveMimeType(originalName, file.mimetype);

    const shortId = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `${cleanFolder}/${shortId}${ext}`;

    const endpointUrl = `${this.r2Endpoint}/${key}`;

    try {
      const response = await this.awsClient.fetch(endpointUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': file.size.toString(),
          'Content-Disposition': 'inline',
        },
        body: new Uint8Array(file.buffer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `R2 Upload failed [${response.status}]: ${errorText}`,
        );
        throw new BadRequestException('Tải file lên R2 thất bại');
      }

      return {
        url: `${this.publicUrl}/${key}`,
        key,
        name: originalName,
        size: file.size,
        mimeType,
        category,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Error uploading to R2: ${error}`);
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi tải file lên Cloudflare R2',
      );
    }
  }

  async uploadToTemp(
    file: Express.Multer.File,
  ): Promise<TempUploadResponseDto> {
    const result = await this.uploadFile(file, UploadFolder.TEMP);
    return {
      tempKey: result.key,
      url: result.url,
    };
  }

  async validateTempKey(tempKey: string): Promise<boolean> {
    if (!tempKey || !UploadService.TEMP_KEY_REGEX.test(tempKey)) {
      return false;
    }

    try {
      const response = await this.awsClient.fetch(
        `${this.r2Endpoint}/${tempKey}`,
        {
          method: 'HEAD',
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async copyTempToUploads(tempKey: string): Promise<string> {
    if (!tempKey || !UploadService.TEMP_KEY_REGEX.test(tempKey)) {
      throw new BadRequestException('Định dạng tempKey không hợp lệ');
    }

    const exists = await this.validateTempKey(tempKey);
    if (!exists) {
      throw new BadRequestException('File tạm không tồn tại hoặc đã hết hạn');
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `R2 CopyObject failed [${response.status}]: ${errorText}`,
        );
        throw new BadRequestException(
          'Sao chép file từ temp sang uploads thất bại',
        );
      }

      return `${this.publicUrl}/${destKey}`;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Error copying object in R2: ${error}`);
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi sao chép file trên Cloudflare R2',
      );
    }
  }

  async deleteTempFile(tempKey: string): Promise<void> {
    if (!tempKey || !UploadService.TEMP_KEY_REGEX.test(tempKey)) {
      return;
    }

    const deleteUrl = `${this.r2Endpoint}/${tempKey}`;

    try {
      const response = await this.awsClient.fetch(deleteUrl, {
        method: 'DELETE',
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
