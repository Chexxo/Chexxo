import { CodedError } from "../../shared/types/errors/CodedError";

export class StorageError extends CodedError {
  readonly code: number = 802;
  readonly name: string = "StorageError";
  readonly message: string = "Storage operation failed.";
  readonly publicMessage: string = this.message;
}
