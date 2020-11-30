export class StorageError extends Error {
  readonly name: string = "StorageError";
  readonly message: string = "Storage operation failed.";
}
