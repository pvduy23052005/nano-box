import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { TempUploadResponseDto } from './dto/temp-upload-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  UploadFolder,
  ALLOWED_UPLOAD_FOLDERS,
} from './constants/upload.constant';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'Vui lòng cung cấp file trong trường "file"',
      );
    }

    const targetFolder = folder || UploadFolder.UPLOADS;
    if (!ALLOWED_UPLOAD_FOLDERS.includes(targetFolder)) {
      throw new BadRequestException(
        `Thư mục không hợp lệ. Chỉ cho phép: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
      );
    }

    return this.uploadService.uploadFile(file, targetFolder);
  }

  @Post('temp')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadTemp(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TempUploadResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'Vui lòng cung cấp file trong trường "file"',
      );
    }

    const result = await this.uploadService.uploadToTemp(file);

    return result;
  }
}
