export default class StorageError extends Error {
  constructor(message: string, readonly stack?: string) {
    super(message);
  }
}
