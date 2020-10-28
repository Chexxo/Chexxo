import { WebRequest } from "webextension-polyfill-ts";

import Certificate from "../types/CommonTypes/certificate/Certificate";
import { Quality } from "../types/Quality";
import TabData from "../types/TabData";
import CertificateAnalyzer from "./CertificateAnalyzer";
import CertificateProvider from "./CertificateProvider";

export default class CertificateService {
  private tabCache: Map<number, TabData>;

  constructor(
    private realCertificateProvider: CertificateProvider,
    private certificateAnalyzer: CertificateAnalyzer
  ) {
    this.tabCache = new Map<number, TabData>();
  }

  async fetchCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<void> {
    const { tabId } = requestDetails;
    const tabData: TabData = new TabData();

    try {
      tabData.certificate = await this.realCertificateProvider.getCertificate(
        requestDetails
      );

      if (tabData.certificate) {
        tabData.quality = this.certificateAnalyzer.getQuality(
          tabData.certificate
        );
      }
    } catch (e) {
      tabData.error = e;
    }

    this.tabCache.set(tabId, tabData);
  }

  getCertificate(tabId: number): Certificate | undefined {
    return this.tabCache.get(tabId)?.certificate;
  }

  getQuality(tabId: number): Quality | undefined {
    return this.tabCache.get(tabId)?.quality;
  }

  getError(tabId: number): Error | undefined {
    return this.tabCache.get(tabId)?.error;
  }
}
