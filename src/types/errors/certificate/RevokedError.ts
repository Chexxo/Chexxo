import CertificateError from "./CertificateError";

export default class RevokedError extends CertificateError {
  readonly name: string = "Certificate revoked exception";
  readonly code: number = 105;
  readonly message: string = "The Certificate was revoked.";
  readonly publicMessage: string = this.message;
}
