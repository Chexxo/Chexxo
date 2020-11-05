import { WebRequest } from "webextension-polyfill-ts";

import Certificate from "../../types/CommonTypes/certificate/Certificate";
import ErrorMessage from "../../types/errors/ErrorMessage";
import { Quality } from "../../types/Quality";
import TabData from "../../types/TabData";
import CertificateAnalyzer from "../providers/CertificateAnalyzer";
import CertificateProvider from "../providers/CertificateProvider";

export default class CertificateStore {
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
    } catch (error) {
      tabData.errorMessage = ErrorMessage.fromError(error);
    }

    this.tabCache.set(tabId, tabData);
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
