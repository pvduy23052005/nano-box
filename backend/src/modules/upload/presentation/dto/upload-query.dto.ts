import { IsEnum, IsOptional } from 'class-validator';
import { UploadFolder } from '../../domain/upload.type';

export class UploadQueryDto {
  @IsOptional()
  @IsEnum(UploadFolder, {
    message: 'Thư mục không hợp lệ. Chỉ cho phép: uploads, temp, avatars',
  })
  folder?: UploadFolder;
}
