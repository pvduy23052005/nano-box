import { DomainValidationException } from '../../../domain/domain-validation.exception';
import { UploadFolder } from '../../../domain/upload.type';
import { FileUploadInput } from '../../dto/file-upload.input';
import { UploadAdapter } from '../../ports/upload.port';
import { UploadFileUseCase } from '../upload-file.use-case';
import { UploadTempFileUseCase } from '../upload-temp-file.use-case';

describe('UploadFileUseCase & UploadTempFileUseCase', () => {
  let uploadMock: jest.Mock<Promise<string>, [Buffer, string, string, string]>;
  let uploadAdapter: jest.Mocked<UploadAdapter>;
  let uploadFileUseCase: UploadFileUseCase;
  let uploadTempFileUseCase: UploadTempFileUseCase;

  beforeEach(() => {
    uploadMock = jest.fn<Promise<string>, [Buffer, string, string, string]>();

    uploadAdapter = {
      upload: uploadMock,
      copyTempToUploads: jest.fn(),
      deleteTempFile: jest.fn(),
      validateTempKey: jest.fn(),
    };

    uploadFileUseCase = new UploadFileUseCase(uploadAdapter);
    uploadTempFileUseCase = new UploadTempFileUseCase(uploadFileUseCase);
  });

  it('should successfully upload a file and return UploadResponseDto', async () => {
    const mockFile: FileUploadInput = {
      originalname: 'document.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      buffer: Buffer.from('dummy-content'),
    };

    uploadMock.mockResolvedValue(
      'https://cdn.example.com/uploads/document.pdf',
    );

    const result = await uploadFileUseCase.execute(
      mockFile,
      UploadFolder.UPLOADS,
    );

    expect(result.name).toBe('document.pdf');
    expect(result.size).toBe(1024);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.category).toBe('document');
    expect(result.url).toBe('https://cdn.example.com/uploads/document.pdf');
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it('should throw DomainValidationException when file buffer is missing', async () => {
    await expect(
      uploadFileUseCase.execute({} as FileUploadInput),
    ).rejects.toThrow(DomainValidationException);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('should throw DomainValidationException when folder is invalid', async () => {
    const mockFile: FileUploadInput = {
      originalname: 'document.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      buffer: Buffer.from('dummy'),
    };

    await expect(
      uploadFileUseCase.execute(mockFile, 'invalid-folder'),
    ).rejects.toThrow(DomainValidationException);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('should upload to temp folder via UploadTempFileUseCase', async () => {
    const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const mockFile: FileUploadInput = {
      originalname: 'image.jpg',
      size: validJpgBuffer.length,
      mimetype: 'image/jpeg',
      buffer: validJpgBuffer,
    };

    uploadMock.mockResolvedValue('https://cdn.example.com/temp/image.jpg');

    const result = await uploadTempFileUseCase.execute(mockFile);

    expect(result.url).toBe('https://cdn.example.com/temp/image.jpg');
    expect(result.tempKey).toMatch(/^temp\//);
    expect(uploadMock).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.stringMatching(/^temp\//),
      'image/jpeg',
      expect.any(String),
    );
  });

  it('should reject non-image upload to avatars folder', async () => {
    const pdfFile: FileUploadInput = {
      originalname: 'document.pdf',
      size: 512,
      mimetype: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 sample content'),
    };

    await expect(
      uploadFileUseCase.execute(pdfFile, UploadFolder.AVATARS),
    ).rejects.toThrow(DomainValidationException);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('should upload valid image to avatars folder', async () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const avatarFile: FileUploadInput = {
      originalname: 'avatar.png',
      size: pngBuffer.length,
      mimetype: 'image/png',
      buffer: pngBuffer,
    };

    uploadMock.mockResolvedValue('https://cdn.example.com/avatars/avatar.png');

    const result = await uploadFileUseCase.execute(
      avatarFile,
      UploadFolder.AVATARS,
    );

    expect(result.category).toBe('image');
    expect(result.mimeType).toBe('image/png');
    expect(result.url).toBe('https://cdn.example.com/avatars/avatar.png');
  });
});
