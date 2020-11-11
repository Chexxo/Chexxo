import { WebNavigation, WebRequest } from "webextension-polyfill-ts";
import Certificate from "../../types/certificate/Certificate";
import CertificateErrorAnalyzer from "./helpers/CertificateErrorAnalyzer";
import CertificateParser from "./helpers/CertificateParser";
import CertificateProvider from "./providers/CertificateProvider";

export default class CertificateService {
  constructor(private certificateProvider: CertificateProvider) {}

  async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate> {
    const rawData = await this.certificateProvider.getCertificate(
      requestDetails
    );

    const certificate = CertificateParser.getCertificate(rawData);
    return certificate;
  }

  analyzeError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): Error | undefined {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
