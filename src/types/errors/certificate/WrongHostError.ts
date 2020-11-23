import CertificateError from "./CertificateError";

/**
 * If a certificate is not valid for the requested domain this error gets thrown.
 */
export default class InvalidDomainError extends CertificateError {
  readonly name: string = "Certificate invalid host exception";
  readonly code: number = 102;
  readonly message: string = "The certificate is not valid for this domain.";
  readonly publicMessage: string = this.message;
}
