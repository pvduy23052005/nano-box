import * as path from 'path';
import * as crypto from 'crypto';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import {
  FileCategory,
  UploadedFileProps,
  CreateUploadedFileInput,
  UploadFolder,
} from './upload.type';
import {
  detectFileCategory,
  resolveMimeType,
  isValidImageMagicBytes,
  isRasterImage,
  MAX_FILE_SIZE,
} from './upload.constant';

export class UploadedFileEntity {
  private readonly _name: string;
  private readonly _size: number;
  private readonly _mimeType: string;
  private readonly _category: FileCategory;
  private readonly _key: string;
  private _url?: string;

  private constructor(props: UploadedFileProps) {
    this._name = props.name;
    this._size = props.size;
    this._mimeType = props.mimeType;
    this._category = props.category;
    this._key = props.key;
    this._url = props.url;
  }

  static create(input: CreateUploadedFileInput): UploadedFileEntity {
    if (!input.originalName || input.size <= 0) {
      throw new DomainValidationException({
        file: 'File không hợp lệ hoặc rỗng',
      });
    }

    if (input.size > MAX_FILE_SIZE) {
      const maxMb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      throw new DomainValidationException({
        file: `Kích thước file vượt quá giới hạn tối đa ${maxMb}MB`,
      });
    }

    const originalName = input.originalName || 'file';
    const originalExt = path.extname(originalName);
    const ext = originalExt.toLowerCase();
    let category = detectFileCategory(input.mimeType, originalName);
    let mimeType = resolveMimeType(originalName, input.mimeType);

    if (input.folder === (UploadFolder.AVATARS as string)) {
      if (category !== 'image' || !isRasterImage(mimeType)) {
        throw new DomainValidationException({
          file: 'Avatar chỉ chấp nhận các định dạng hình ảnh raster (JPEG, PNG, WebP, GIF, AVIF)',
        });
      }
    }

    if (category === 'image' && input.buffer) {
      const isRealImage = isValidImageMagicBytes(input.buffer);
      if (!isRealImage) {
        if (input.folder === (UploadFolder.AVATARS as string)) {
          throw new DomainValidationException({
            file: 'Nội dung file không đúng định dạng hình ảnh hợp lệ',
          });
        }
        category = 'other';
        mimeType = 'application/octet-stream';
      }
    }

    const rawBaseName = path
      .basename(originalName, originalExt)
      .replace(/[đĐ]/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const cleanBaseName = rawBaseName ? `-${rawBaseName}` : '';

    const shortId = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `${input.folder}/${shortId}${cleanBaseName}${ext}`;

    return new UploadedFileEntity({
      name: originalName,
      size: input.size,
      mimeType,
      category,
      key,
    });
  }

  static restore(props: UploadedFileProps): UploadedFileEntity {
    return new UploadedFileEntity(props);
  }

  getName(): string {
    return this._name;
  }

  getSize(): number {
    return this._size;
  }

  getMimeType(): string {
    return this._mimeType;
  }

  getCategory(): FileCategory {
    return this._category;
  }

  getKey(): string {
    return this._key;
  }

  getUrl(): string | undefined {
    return this._url;
  }

  setUrl(url: string): void {
    this._url = url;
  }
}
