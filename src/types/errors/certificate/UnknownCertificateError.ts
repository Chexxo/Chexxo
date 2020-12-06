import { CertificateError } from "./CertificateError";

export class UnknownCertificateError extends CertificateError {
  readonly name: string = "Unknown certificate exception";
  readonly code: number = 106;
  readonly message: string =
    "The browser provided an unknown certificate error.";
  readonly publicMessage: string = this.message;

  constructor(message?: string) {
    super();
    if (message) {
      this.message = message;
    }
  }
}
