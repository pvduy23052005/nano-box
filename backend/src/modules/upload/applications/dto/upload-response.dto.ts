import { FileCategory } from '../../domain/upload.type';

export class UploadResponseDto {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  category?: FileCategory;
}
