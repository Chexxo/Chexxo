import { CertificateError } from "./CertificateError";

/**
 * If a certificate has been revoked by the issuer this
 * error gets thrown.
 */
export class RevokedError extends CertificateError {
  readonly name: string = "Certificate revoked exception";
  readonly code: number = 105;
  readonly message: string = "The Certificate was revoked.";
  readonly publicMessage: string = this.message;
}
