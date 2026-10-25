import { UploadTempFileUseCase } from '../upload-temp-file.use-case';
import { UploadFileUseCase } from '../upload-file.use-case';
import { UploadFolder } from '../../../domain/upload.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

describe('UploadTempFileUseCase', () => {
  let uploadTempFileUseCase: UploadTempFileUseCase;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;

  beforeEach(() => {
    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    uploadTempFileUseCase = new UploadTempFileUseCase(uploadFileUseCase);
  });

  it('should delegate upload to UploadFileUseCase with UploadFolder.TEMP and return TempUploadResponseDto', async () => {
    const mockFile = {
      buffer: Buffer.from('test buffer content'),
      originalname: 'test-image.png',
      mimetype: 'image/png',
      size: 19,
    };

    uploadFileUseCase.execute.mockResolvedValue({
      name: 'test-image.png',
      size: 19,
      mimeType: 'image/png',
      category: 'image',
      key: 'temp/123-test-image.png',
      url: 'https://cdn.example.com/temp/123-test-image.png',
    });

    const result = await uploadTempFileUseCase.execute(mockFile);

    expect(uploadFileUseCase.execute).toHaveBeenCalledWith(
      mockFile,
      UploadFolder.TEMP,
    );
    expect(result).toEqual({
      tempKey: 'temp/123-test-image.png',
      url: 'https://cdn.example.com/temp/123-test-image.png',
    });
  });

  it('should propagate DomainValidationException if UploadFileUseCase throws', async () => {
    const mockFile = {
      buffer: Buffer.alloc(0),
      originalname: '',
      mimetype: '',
      size: 0,
    };

    uploadFileUseCase.execute.mockRejectedValue(
      new DomainValidationException({ file: 'Vui lòng chọn file hợp lệ để tải lên' }),
    );

    await expect(uploadTempFileUseCase.execute(mockFile)).rejects.toThrow(
      DomainValidationException,
    );
  });
});
