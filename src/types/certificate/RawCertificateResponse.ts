import { RawCertificate } from "../../shared/types/certificate/RawCertificate";

/**
 * Class respresenting a raw certificate response.
 * This class is used in order to respresent the
 * response of the {@link CertificateProvider}
 * which may throw an error.
 */
export class RawCertificateResponse {
  constructor(
    readonly requestUuid: string,
    readonly rawCertificate?: RawCertificate,
    readonly error?: Error
  ) {}
}
