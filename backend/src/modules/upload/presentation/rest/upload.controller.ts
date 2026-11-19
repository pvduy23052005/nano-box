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
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UploadThrottlerGuard } from './guards/upload-throttler.guard';
import { UploadFileUseCase } from '../../applications/use-case/upload-file.use-case';
import { UploadTempFileUseCase } from '../../applications/use-case/upload-temp-file.use-case';
import { UploadResponseDto } from '../../applications/dto/upload-response.dto';
import { TempUploadResponseDto } from '../../applications/dto/temp-upload-response.dto';
import { UploadQueryDto } from '../dto/upload-query.dto';
import { UploadFolder } from '../../domain/upload.type';
import { MAX_FILE_SIZE } from '../../domain/upload.constant';

@Controller('upload')
@UseGuards(AuthGuard, UploadThrottlerGuard)
export class UploadController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly uploadTempFileUseCase: UploadTempFileUseCase,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadQueryDto,
  ): Promise<UploadResponseDto> {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Vui lòng cung cấp file trong trường "file"',
      );
    }

    const targetFolder = query.folder || UploadFolder.UPLOADS;
    return this.uploadFileUseCase.execute(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
      targetFolder,
    );
  }

  @Post('temp')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadTemp(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TempUploadResponseDto> {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Vui lòng cung cấp file trong trường "file"',
      );
    }

    return this.uploadTempFileUseCase.execute({
      buffer: file.buffer,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });
  }
}
