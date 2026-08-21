import { FileCategory } from '../constants/upload.constant';

export class UploadResponseDto {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  category?: FileCategory;
}
