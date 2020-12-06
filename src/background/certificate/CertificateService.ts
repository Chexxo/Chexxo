import { CertificateResponse } from "../../types/certificate/CertificateResponse";
import { Configuration } from "../../types/Configuration";
import { CertificateErrorAnalyzer } from "./helpers/CertificateErrorAnalyzer";
import { CertificateParser } from "./helpers/CertificateParser";
import { CertificateProvider } from "./providers/CertificateProvider";
import { ServerProvider } from "./providers/ServerProvider";

export class CertificateService {
  constructor(private certificateProvider: CertificateProvider) {}

  updateConfiguration(configuration: Configuration): void {
    if (this.certificateProvider instanceof ServerProvider) {
      (this.certificateProvider as ServerProvider).updateServerUrl(
        configuration.serverUrl
      );
    }
  }

  async getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<CertificateResponse> {
    const rawCertificateResponse = await this.certificateProvider.getCertificate(
      requestDetails
    );

    if (rawCertificateResponse.rawCertificate !== undefined) {
      const certificate = CertificateParser.getCertificate(
        rawCertificateResponse.rawCertificate
      );
      return new CertificateResponse(
        rawCertificateResponse.requestUuid,
        certificate
      );
    }

    return new CertificateResponse(
      rawCertificateResponse.requestUuid,
      undefined,
      rawCertificateResponse.error
    );
  }

  analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
