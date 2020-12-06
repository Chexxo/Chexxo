import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

export interface CertificateProvider {
  getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<RawCertificateResponse>;
}
