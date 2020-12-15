import { CodedError } from "../../shared/types/errors/CodedError";

/**
 * If the connection of a website is not secure due to error regarding
 * certificates or the connection itself this error gets thrown.
 */
export class InsecureConnectionError extends CodedError {
  readonly name: string = "InsecureConnectionError";
  readonly message: string = "Server responded with an insecure connection.";
  readonly publicMessage: string = this.message;
}
