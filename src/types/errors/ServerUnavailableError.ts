import { CodedError } from "../../shared/types/errors/CodedError";

/**
 * If the chexxo server could not be contacted this error
 * gets thrown.
 */
export class ServerUnavailableError extends CodedError {
  readonly code: number = 801;
  readonly name = "ServerUnavailableError";
  readonly message = "Server is unavailable right now.";
  readonly publicMessage: string = this.message;
}
