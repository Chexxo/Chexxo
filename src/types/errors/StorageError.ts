import { CodedError } from "../../shared/types/errors/CodedError";

/**
 * If there was a problem with the browser storage this
 * error gets thrown.
 */
export class StorageError extends CodedError {
  readonly code: number = 802;
  readonly name: string = "StorageError";
  readonly message: string = "Storage operation failed.";
  readonly publicMessage: string = this.message;
}
