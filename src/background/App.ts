import { ErrorMessage } from "../types/errors/ErrorMessage";
import { TabData } from "../types/TabData";
import { CertificateService } from "./certificate/CertificateService";
import { QualityService } from "./quality/QualityService";
import { Configurator } from "../helpers/Configurator";
import { Configuration } from "../types/Configuration";
import { CertificateResponse } from "../types/certificate/CertificateResponse";
import { RawCertificateResponse } from "../types/certificate/RawCertificateResponse";
import { LogLevel } from "../shared/logger/Logger";
import { UUIDFactory } from "../helpers/UUIDFactory";
import { CodedError } from "../shared/types/errors/CodedError";
import { UnknownError } from "../types/errors/UnknownError";
import { InBrowserLogger } from "./logger/InBrowserLogger";
import { LogEntry } from "../shared/types/logger/LogEntry";

export class App {
  private tabCache = new Map<number, TabData>();

  constructor(
    private certificateService: CertificateService,
    private qualityService: QualityService,
    private configurator: Configurator,
    private logger: InBrowserLogger
  ) {
    this.tabCache = new Map<number, TabData>();
    configurator.addListener(this.updateConfiguration.bind(this));
  }

  public async init(): Promise<void> {
    const configuration = await this.configurator.getConfiguration();
    this.updateConfiguration(configuration);
  }

  public updateConfiguration(configuration: Configuration): void {
    this.certificateService.updateConfiguration(configuration);
    this.qualityService.updateConfiguration(configuration);
  }

  public resetTabData(tabId: number): void {
    this.tabCache.delete(tabId);
  }

  public async fetchCertificate(requestDetails: {
    url: string;
    tabId: number;
    requestId?: string;
  }): Promise<void> {
    const { url, tabId } = requestDetails;
    const tabData = this.tabCache.get(tabId) || new TabData();

    try {
      const certificateResponse = await this.certificateService.getCertificate(
        requestDetails
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tabData.certificate = certificateResponse.certificate!;
      tabData.quality = this.qualityService.getQuality(tabData.certificate);

      this.logger.log(
        certificateResponse.requestUuid,
        LogLevel.INFO,
        `Request ${url} Response: 200`
      );
    } catch (errorResponse) {
      this.logError(requestDetails.url, errorResponse);
      tabData.errorMessage = ErrorMessage.fromError(errorResponse);
    }

    this.tabCache.set(tabId, tabData);
  }

  public async analyzeQuality(requestDetails: {
    tabId: number;
    url: string;
  }): Promise<boolean> {
    const { tabId, url } = requestDetails;
    const tabData = this.tabCache.get(tabId);
    if (tabData) {
      if (tabData.quality) {
        const hasQualityDecreased = await this.qualityService.hasQualityDecreased(
          url,
          tabData.quality
        );

        if (hasQualityDecreased) {
          tabData.errorMessage = new ErrorMessage(
            "The websites certificate has decreased in quality since your last visit."
          );
          this.tabCache.set(tabId, tabData);
          return true;
        } else {
          this.qualityService.defineQuality(url, tabData.quality);
        }
      }
    }

    return false;
  }

  public analyzeError(requestDetails: {
    url: string;
    tabId: number;
    frameId: number;
    error: string;
  }): void {
    const { tabId } = requestDetails;
    const error = this.certificateService.analyzeError(requestDetails);

    if (error !== null) {
      this.logError(
        requestDetails.url,
        new CertificateResponse(UUIDFactory.uuidv4(), undefined, error)
      );
      const errorMessage = ErrorMessage.fromError(error);
      const tabData = this.tabCache.get(tabId) || new TabData();
      tabData.errorMessage = errorMessage;
      this.tabCache.set(tabId, tabData);
    }
  }

  public getTabData(tabId: number): TabData | undefined {
    return this.tabCache.get(tabId);
  }

  public async resetQuality(url: string): Promise<void> {
    await this.qualityService.resetQuality(url);
  }

  public async getConfiguration(): Promise<Configuration> {
    return await this.configurator.getConfiguration();
  }

  public async setConfiguration(configuration: Configuration): Promise<void> {
    await this.configurator.setConfiguration(configuration);
  }

  public async removeCache(): Promise<void> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Cache was removed.`);
    return this.qualityService.removeQualities();
  }

  public async exportLogs(): Promise<LogEntry[] | null> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Logs were exported.`);
    return this.logger.getAll();
  }

  public async removeLogs(): Promise<void> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Logs were removed.`);
    return this.logger.removeAll();
  }

  private logError(url: string, errorResponse: unknown) {
    let logLevel = LogLevel.ERROR;
    let responseMessage = "Unknown Error";
    let responseError: CodedError | undefined;

    if (
      errorResponse instanceof CertificateResponse ||
      errorResponse instanceof RawCertificateResponse
    ) {
      if (errorResponse.error instanceof CodedError) {
        if (errorResponse.error.code !== 500) {
          logLevel = LogLevel.WARNING;
        }
        responseMessage = errorResponse.error.message;
        responseError = errorResponse.error;
      } else {
        responseError = new UnknownError(<Error>errorResponse.error);
      }
    } else {
      responseError = new UnknownError(<Error>errorResponse);
    }
    this.logger.log(
      UUIDFactory.uuidv4(),
      logLevel,
      `Request: ${url} Response: ${responseMessage}`,
      responseError
    );
  }
}
