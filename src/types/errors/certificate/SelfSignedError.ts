import CertificateError from "./CertificateError";

/**
 * If a certificate has not been signed by a trusted entity this error gets thrown.
 */
export default class SelfSignedError extends CertificateError {
  readonly name: string = "Certificate self signed exception";
  readonly code: number = 103;
  readonly message: string =
    "The certificate has not been signed by a trusted entity.";
  readonly publicMessage: string = this.message;
}
