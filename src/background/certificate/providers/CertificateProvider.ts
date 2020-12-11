import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

/**
 * Interfaces that defines the functionality common to
 * all certificate providers.
 */
export interface CertificateProvider {
  /**
   * Returns the TLS-certificate for the domain given
   * inside the request details.
   *
   * @param requestDetails The details for the request
   * made by the browser to the domain of interest.
   */
  getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<RawCertificateResponse>;
}
