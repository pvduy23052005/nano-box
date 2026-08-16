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
import {
  detectFileCategory,
  resolveMimeType,
  MAX_FILE_SIZE,
} from './constants/upload.constant';

@Injectable()
export class UploadService {
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

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadResponseDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng chọn file hợp lệ để tải lên');
    }

    if (file.size > MAX_FILE_SIZE) {
      const maxMb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `Kích thước file vượt quá giới hạn tối đa ${maxMb}MB`,
      );
    }

    const originalName = file.originalname || 'file';
    const ext = path.extname(originalName).toLowerCase();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const category = detectFileCategory(file.mimetype, originalName);
    const mimeType = resolveMimeType(originalName, file.mimetype);

    const shortId = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
    const key = cleanFolder
      ? `${cleanFolder}/${shortId}${ext}`
      : `${shortId}${ext}`;

    const endpointUrl = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;

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
}
