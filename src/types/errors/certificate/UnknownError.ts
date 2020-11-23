import CertificateError from "./CertificateError";

export default class UnknownError extends CertificateError {
  readonly name: string = "Unknown certificate exception";
  readonly code: number = 106;
  readonly message: string =
    "The browser provided an unknown certificate error.";
  readonly publicMessage: string = this.message;
}
