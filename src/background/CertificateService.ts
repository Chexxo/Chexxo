import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../types/CommonTypes/certificate/Certificate";
import CertificateProvider from "./CertificateProvider";

export default class CertificateService {
  private certificateCache: Map<number, Certificate>;

  constructor(private realCertificateProvider: CertificateProvider) {
    this.certificateCache = new Map<number, Certificate>();
  }

  async fetchCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<void> {
    const { tabId } = requestDetails;
    const certificate = await this.realCertificateProvider.getCertificate(
      requestDetails
    );
    this.certificateCache.set(tabId, certificate);
  }

  getCertificate(key: number): Certificate | undefined {
    return this.certificateCache.get(key);
  }
}
