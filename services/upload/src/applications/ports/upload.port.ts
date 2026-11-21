export abstract class UploadAdapter {
  abstract upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    contentDisposition: string,
  ): Promise<string>;

  abstract copyTempToUploads(tempKey: string): Promise<string>;

  abstract deleteTempFile(tempKey: string): Promise<void>;

  abstract validateTempKey(tempKey: string): Promise<boolean>;
}
