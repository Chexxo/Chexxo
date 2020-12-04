import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";

export interface CertificateProvider {
  getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<RawCertificate>;
}
