export type FileCategory = 'image' | 'audio' | 'document' | 'video' | 'other';

export enum UploadFolder {
  UPLOADS = 'uploads',
  TEMP = 'temp',
  AVATARS = 'avatars',
}

export const ALLOWED_UPLOAD_FOLDERS: readonly string[] =
  Object.values(UploadFolder);

export interface UploadedFileProps {
  name: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  key: string;
  url?: string;
}

export interface CreateUploadedFileInput {
  originalName: string;
  size: number;
  mimeType: string;
  folder: string;
  buffer?: Buffer;
}
