import { WebRequest } from "webextension-polyfill-ts";

import { Certificate } from "../types/certificate/Certificate";
import { ErrorMessage } from "../types/errors/ErrorMessage";
import { Quality } from "../types/Quality";
import { TabData } from "../types/TabData";
import { CertificateService } from "./certificate/CertificateService";
import { QualityService } from "./quality/QualityService";
import { Configurator } from "../helpers/Configurator";
import { Configuration } from "../types/Configuration";

export class App {
  private tabCache: Map<number, TabData>;

  constructor(
    private certificateService: CertificateService,
    private qualityService: QualityService,
    private configurator: Configurator
  ) {
    this.tabCache = new Map<number, TabData>();
    configurator.addListener(this.updateConfiguration.bind(this));
  }

  async init(): Promise<void> {
    const configuration = await this.configurator.getConfiguration();
    this.updateConfiguration(configuration);
  }

  updateConfiguration(configuration: Configuration): void {
    this.certificateService.updateConfiguration(configuration);
  }

  resetTabData(tabId: number): void {
    this.tabCache.delete(tabId);
  }

  async fetchCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<void> {
    const { tabId } = requestDetails;
    const tabData = this.tabCache.get(tabId) || new TabData();

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

  analyzeError(requestDetails: {
    url: string;
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

  async getConfiguration(): Promise<Configuration> {
    return await this.configurator.getConfiguration();
  }

  async setConfiguration(configuration: Configuration): Promise<void> {
    await this.configurator.setConfiguration(configuration);
  }
}
