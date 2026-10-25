import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UploadedFileEntity } from '../uploaded-file.entity';
import { UploadFolder } from '../upload.type';

describe('UploadedFileEntity', () => {
  it('should successfully create an entity and sanitize Vietnamese filename', () => {
    const entity = UploadedFileEntity.create({
      originalName: 'Hình ảnh đại diện mới.PNG',
      size: 1024 * 50,
      mimeType: 'image/png',
      folder: UploadFolder.AVATARS,
    });

    expect(entity.getName()).toBe('Hình ảnh đại diện mới.PNG');
    expect(entity.getSize()).toBe(51200);
    expect(entity.getCategory()).toBe('image');
    expect(entity.getMimeType()).toBe('image/png');
    expect(entity.getKey()).toMatch(
      /^avatars\/[a-z0-9-]+-hinh-anh-dai-dien-moi\.png$/,
    );
  });

  it('should throw DomainValidationException if file size exceeds MAX_FILE_SIZE', () => {
    expect(() => {
      UploadedFileEntity.create({
        originalName: 'huge-file.zip',
        size: 30 * 1024 * 1024, // 30MB > 25MB
        mimeType: 'application/zip',
        folder: UploadFolder.UPLOADS,
      });
    }).toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if size is zero or invalid', () => {
    expect(() => {
      UploadedFileEntity.create({
        originalName: '',
        size: 0,
        mimeType: 'text/plain',
        folder: UploadFolder.TEMP,
      });
    }).toThrow(DomainValidationException);
  });

  it('should correctly restore an existing uploaded file entity', () => {
    const entity = UploadedFileEntity.restore({
      name: 'avatar.jpg',
      size: 2048,
      mimeType: 'image/jpeg',
      category: 'image',
      key: 'avatars/xyz.jpg',
      url: 'https://cdn.example.com/avatars/xyz.jpg',
    });

    expect(entity.getName()).toBe('avatar.jpg');
    expect(entity.getKey()).toBe('avatars/xyz.jpg');
    expect(entity.getUrl()).toBe('https://cdn.example.com/avatars/xyz.jpg');
  });

  it('should accept an image with valid PNG magic bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00]);
    const entity = UploadedFileEntity.create({
      originalName: 'photo.png',
      size: pngBuffer.length,
      mimeType: 'image/png',
      folder: UploadFolder.AVATARS,
      buffer: pngBuffer,
    });

    expect(entity.getCategory()).toBe('image');
    expect(entity.getMimeType()).toBe('image/png');
  });

  it('should throw DomainValidationException if fake image is uploaded to avatars folder', () => {
    const fakeBuffer = Buffer.from('<html><body>fake image</body></html>');
    expect(() => {
      UploadedFileEntity.create({
        originalName: 'avatar.jpg',
        size: fakeBuffer.length,
        mimeType: 'image/jpeg',
        folder: UploadFolder.AVATARS,
        buffer: fakeBuffer,
      });
    }).toThrow(DomainValidationException);
  });

  it('should demote fake image to category other and application/octet-stream in non-avatar folders', () => {
    const fakeBuffer = Buffer.from('plain text script');
    const entity = UploadedFileEntity.create({
      originalName: 'document.jpg',
      size: fakeBuffer.length,
      mimeType: 'image/jpeg',
      folder: UploadFolder.UPLOADS,
      buffer: fakeBuffer,
    });

    expect(entity.getCategory()).toBe('other');
    expect(entity.getMimeType()).toBe('application/octet-stream');
  });
});
