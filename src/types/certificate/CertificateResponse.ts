import { Certificate } from "./Certificate";

/**
 * Class respresenting a certificate response. This
 * class is used in order to respresent the response
 * of the {@link CertificateParser} which may throw
 * an error.
 */
export class CertificateResponse {
  constructor(
    readonly requestUuid: string,
    readonly certificate?: Certificate,
    readonly error?: Error
  ) {}
}
