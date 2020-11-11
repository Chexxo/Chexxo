import CertificateError from "./CertificateError";

/**
 * If a certificate has expired this error gets thrown.
 */
export default class ExpiredError extends CertificateError {
  readonly name: string = "Certificate expired exception";
  readonly code: number = 101;
  readonly message: string = "The Certificate is not valid at this time.";
  readonly publicMessage: string = this.message;
}
