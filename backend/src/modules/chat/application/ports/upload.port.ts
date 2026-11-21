export abstract class UploadAdapter {
  abstract copyTempToUploads(tempKey: string): Promise<string>;
  abstract deleteTempFile(tempKey: string): Promise<void>;
  abstract validateTempKey(tempKey: string): Promise<boolean>;
  abstract upload?(
    buffer: Buffer,
    key: string,
    mimeType: string,
    contentDisposition: string,
  ): Promise<string>;
}
