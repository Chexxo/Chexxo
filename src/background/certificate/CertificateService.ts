import { Certificate } from "../../types/certificate/Certificate";
import { CertificateErrorAnalyzer } from "./helpers/CertificateErrorAnalyzer";
import { CertificateParser } from "./helpers/CertificateParser";
import { CertificateProvider } from "./providers/CertificateProvider";

export class CertificateService {
  constructor(private certificateProvider: CertificateProvider) {}

  async getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<Certificate> {
    const rawData = await this.certificateProvider.getCertificate(
      requestDetails
    );

    const certificate = CertificateParser.getCertificate(rawData);
    return certificate;
  }

  analyzeError(requestDetails: {
    frameId: number;
    error: string;
  }): Error | null {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
