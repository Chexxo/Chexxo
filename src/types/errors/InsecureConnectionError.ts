import { CodedError } from "../../shared/types/errors/CodedError";

export class InsecureConnectionError extends CodedError {
  readonly name: string = "InsecureConnectionError";
  readonly message: string = "Server responded with an insecure connection.";
  readonly publicMessage: string = this.message;
}
