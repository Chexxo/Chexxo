import { CodedError } from "../../shared/types/errors/CodedError";

/**
 * This error gets thrown if no more specific error could
 * be identified. This error therefore repsresents an
 * unhandled error.
 */
export class UnknownError extends CodedError {
  readonly code: number = 800;
  readonly name: string = "Unknown Error";
  readonly message: string = "Unknown Error Occured";
  readonly publicMessage: string = this.message;
  readonly trace?: string;

  /**
   * @param error The error which lead to this exception.
   */
  constructor(error?: Error) {
    super();
    if (error) {
      super.stack = error.stack;
      this.name = error.name;
      this.message = error.message;
      this.publicMessage = error.message;
      this.trace = error.stack;
    }
  }
}
