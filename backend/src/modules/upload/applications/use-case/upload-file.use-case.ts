import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UploadAdapter } from '../ports/upload.port';
import { UploadResponseDto } from '../dto/upload-response.dto';
import { FileUploadInput } from '../dto/file-upload.input';
import { UploadedFileEntity } from '../../domain/uploaded-file.entity';
import { UploadFolder, ALLOWED_UPLOAD_FOLDERS } from '../../domain/upload.type';
import { resolveContentDisposition } from '../../infrastructure/constants/upload.constant';

export class UploadFileUseCase {
  constructor(private readonly uploadAdapter: UploadAdapter) {}

  async execute(
    file: FileUploadInput,
    folder: string = UploadFolder.UPLOADS,
  ): Promise<UploadResponseDto> {
    if (!file?.buffer) {
      throw new DomainValidationException({
        file: 'Vui lòng chọn file hợp lệ để tải lên',
      });
    }

    if (!ALLOWED_UPLOAD_FOLDERS.includes(folder)) {
      throw new DomainValidationException({
        folder: `Thư mục không hợp lệ. Chỉ cho phép: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
      });
    }

    const entity = UploadedFileEntity.create({
      originalName: file.originalname ?? 'file',
      size: file.size,
      mimeType: file.mimetype ?? '',
      folder,
      buffer: file.buffer,
    });

    if (
      folder === (UploadFolder.AVATARS as string) &&
      entity.getCategory() !== 'image'
    ) {
      throw new DomainValidationException({
        file: 'Thư mục avatars chỉ chấp nhận file hình ảnh',
      });
    }

    const contentDisposition = resolveContentDisposition(
      entity.getName(),
      entity.getMimeType(),
    );

    const publicUrl = await this.uploadAdapter.upload(
      file.buffer,
      entity.getKey(),
      entity.getMimeType(),
      contentDisposition,
    );

    entity.setUrl(publicUrl);

    return {
      url: publicUrl,
      key: entity.getKey(),
      name: entity.getName(),
      size: entity.getSize(),
      mimeType: entity.getMimeType(),
      category: entity.getCategory(),
    };
  }
}
