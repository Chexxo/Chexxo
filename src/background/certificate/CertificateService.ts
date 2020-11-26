import { WebRequest } from "webextension-polyfill-ts";

import { Certificate } from "../../types/certificate/Certificate";
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

  async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate> {
    const rawData = await this.certificateProvider.getCertificate(
      requestDetails
    );

    const certificate = CertificateParser.getCertificate(rawData);
    return certificate;
  }

  analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
