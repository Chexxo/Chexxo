import { WebRequest } from "webextension-polyfill-ts";

import { Certificate } from "../types/certificate/Certificate";
import { ErrorMessage } from "../types/errors/ErrorMessage";
import { Quality } from "../types/Quality";
import { TabData } from "../types/TabData";
import { CertificateService } from "./certificate/CertificateService";
import { QualityService } from "./quality/QualityService";

export class App {
  private tabCache = new Map<number, TabData>();

  constructor(
    private certificateService: CertificateService,
    private qualityService: QualityService
  ) {}

  resetTabData(tabId: number): void {
    this.tabCache.delete(tabId);
  }

  async fetchCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<boolean> {
    const { tabId } = requestDetails;
    const tabData = this.tabCache.get(tabId) || new TabData();

    try {
      tabData.certificate = await this.certificateService.getCertificate(
        requestDetails
      );

      if (!tabData.certificate) {
        return false;
      }

      tabData.quality = this.qualityService.getQuality(tabData.certificate);
      const hasQualityDecreased = await this.qualityService.hasQualityDecreased(
        requestDetails.url,
        tabData.quality
      );

      if (hasQualityDecreased) {
        tabData.errorMessage = new ErrorMessage(
          "The websites certificate has decreased in quality since your last visit."
        );
        return true;
      }

      await this.qualityService.setQuality(requestDetails.url, tabData.quality);
    } catch (error) {
      tabData.errorMessage = ErrorMessage.fromError(error);
    }

    this.tabCache.set(tabId, tabData);
    return false;
  }

  analyzeError(requestDetails: {
    tabId: number;
    frameId: number;
    error: string;
  }): void {
    const { tabId } = requestDetails;
    const error = this.certificateService.analyzeError(requestDetails);

    if (error !== null) {
      const errorMessage = ErrorMessage.fromError(error);
      const tabData = this.tabCache.get(tabId) || new TabData();
      tabData.errorMessage = errorMessage;
      this.tabCache.set(tabId, tabData);
    }
  }

  getCertificate(tabId: number): Certificate | undefined {
    return this.tabCache.get(tabId)?.certificate;
  }

  getQuality(tabId: number): Quality | undefined {
    return this.tabCache.get(tabId)?.quality;
  }

  getErrorMessage(tabId: number): ErrorMessage | undefined {
    return this.tabCache.get(tabId)?.errorMessage;
  }

  async resetQuality(url: string): Promise<void> {
    await this.qualityService.resetQuality(url);
  }
}
