import { UploadFileUseCase } from './upload-file.use-case';
import { TempUploadResponseDto } from '../dto/temp-upload-response.dto';
import { FileUploadInput } from '../dto/file-upload.input';
import { UploadFolder } from '../../domain/upload.type';

export class UploadTempFileUseCase {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  async execute(file: FileUploadInput): Promise<TempUploadResponseDto> {
    const result = await this.uploadFileUseCase.execute(
      file,
      UploadFolder.TEMP,
    );
    return {
      tempKey: result.key,
      url: result.url,
    };
  }
}
