export class StorageException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageException';
  }
}
