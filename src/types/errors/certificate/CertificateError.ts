import { CodedError } from "../../../shared/types/errors/CodedError";

/**
 * Abstract class which is the base class of all certificate related errors.
 */
export abstract class CertificateError extends CodedError {
  readonly name: string = "Certificate Error";
  readonly code: number = 100;
  readonly message: string = "This is an abstract CertificateError.";
  readonly publicMessage: string = this.message;

  /**
   * @param trace Can optionally include the stacktrace of the undelying error.
   */
  constructor(readonly trace?: string) {
    super();
  }
}
