import { CodedError } from "../../shared/types/errors/CodedError";

export class ServerUnavailableError extends CodedError {
  readonly code: number = 801;
  readonly name = "ServerUnavailableError";
  readonly message = "Server is unavailable right now.";
  readonly publicMessage: string = this.message;
}
