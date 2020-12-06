import { WebRequest } from "webextension-polyfill-ts";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

export interface CertificateProvider {
  /**
   * Gets the certificate of the domain specified
   * within the request details.
   *
   * @param requestDetails The request details of
   * the request which lead to this method being
   * invoked.
   */
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificateResponse>;
}
