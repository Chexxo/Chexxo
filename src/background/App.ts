import { WebNavigation, WebRequest } from "webextension-polyfill-ts";

import Certificate from "../types/certificate/Certificate";
import ErrorMessage from "../types/errors/ErrorMessage";
import { Quality } from "../types/Quality";
import TabData from "../types/TabData";
import CertificateService from "./certificate/CertificateService";
import QualityService from "./quality/QualityService";

export default class App {
  private tabCache: Map<number, TabData>;

  constructor(
    private certificateService: CertificateService,
    private qualityService: QualityService
  ) {
    this.tabCache = new Map<number, TabData>();
  }

  async fetchCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<void> {
    const { tabId } = requestDetails;
    const tabData: TabData = new TabData();

    try {
      tabData.certificate = await this.certificateService.getCertificate(
        requestDetails
      );

      if (tabData.certificate) {
        tabData.quality = this.qualityService.getQuality(tabData.certificate);
      }
    } catch (error) {
      tabData.errorMessage = ErrorMessage.fromError(error);
    }

    this.tabCache.set(tabId, tabData);
  }

  analyzeError(requestDetails: WebNavigation.OnErrorOccurredDetailsType): void {
    const { tabId } = requestDetails;
    const error = this.certificateService.analyzeError(requestDetails);

    if (error !== undefined) {
      const errorMessage = ErrorMessage.fromError(error);
      let tabData = this.tabCache.get(tabId);

      if (!tabData) {
        tabData = new TabData();
      }

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
}
