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

/**
 * Class which is responsible for combining the quality
 * and the certificate service. Also this class is used for
 * global error handling and logging.
 */
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

  /**
   * Initialites the application by getting the current configuration
   * of the extension and updating it in all dependent classes.
   */
  public async init(): Promise<void> {
    const configuration = await this.configurator.getConfiguration();
    this.updateConfiguration(configuration);
  }

  /**
   * Updates the configuration of all services the app is aware of.
   *
   * @param configuration The new configuration to be used.
   */
  public updateConfiguration(configuration: Configuration): void {
    this.certificateService.updateConfiguration(configuration);
    this.qualityService.updateConfiguration(configuration);
  }

  /**
   * Resets all saved data for the tab with the given tabId.
   *
   * @param tabId Id of the tab which should be reset.
   */
  public resetTabData(tabId: number): void {
    this.tabCache.delete(tabId);
  }

  /**
   * Fetches the certificate for the url provided in the request details.
   * If an error occures it will be logged and the error forwarded to the
   * frontend. If the certificate could be fetched it will be saved in the
   * tabCache for the tab affected.
   *
   * @param requestDetails The details of the request which lead to this
   * fetch.
   */
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

  /**
   * Analyzes the quality of the certifcate cached for the tab specified
   * within the request details. If the qualiy has not decreased since
   * the last time the user visited the domain the new quality will be
   * saved to cache. Should the quality have decreased an error is
   * written into the tab cache.
   *
   * @param requestDetails The details of the request which contains the
   * tabId of the tab to be analyzed.
   *
   * @returns Boolean if the quality of the certificate has decreased since the
   * last time the user visitied the domain.
   */
  public async analyzeQuality(requestDetails: {
    tabId: number;
    url: string;
  }): Promise<boolean> {
    const { tabId, url } = requestDetails;
    const tabData = this.tabCache.get(tabId);
    if (tabData) {
      if (tabData.quality) {
        const hasQualityDecreased =
          await this.qualityService.hasQualityDecreased(url, tabData.quality);

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

  /**
   * Callback for browser specific errors. Will be called if the browser
   * throws an error regarding navigation. The error will then be analyzed
   * and if it is relevant for the extension it will be saved to the tab
   * cache.
   *
   * @param requestDetails The details of the request which lead to the
   * error.
   */
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

  /**
   * Gets the tab information of the tab id provided.
   *
   * @param tabId The id of the tab from which the information shall
   * be returned.
   */
  public getTabData(tabId: number): TabData | undefined {
    return this.tabCache.get(tabId);
  }

  /**
   * See {@link QualityService.resetQuality}
   */
  public async resetQuality(url: string): Promise<void> {
    await this.qualityService.resetQuality(url);
  }

  /**
   * See {@link Configurator.getConfiguration}
   */
  public async getConfiguration(): Promise<Configuration> {
    return await this.configurator.getConfiguration();
  }

  /**
   * See {@link Configurator.setConfiguration}
   */
  public async setConfiguration(configuration: Configuration): Promise<void> {
    await this.configurator.setConfiguration(configuration);
  }

  /**
   * Removes all saved qualities from the domain cache.
   */
  public async removeCache(): Promise<void> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Cache was removed.`);
    return this.qualityService.removeQualities();
  }

  /**
   * Returns all log entries currently persisted inside the browser storage.
   */
  public async exportLogs(): Promise<LogEntry[] | null> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Logs were exported.`);
    return this.logger.getAll();
  }

  /**
   * Removes all logs which were persisted inside the browser storage.
   */
  public async removeLogs(): Promise<void> {
    this.logger.log(UUIDFactory.uuidv4(), LogLevel.INFO, `Logs were removed.`);
    return this.logger.removeAll();
  }

  /**
   * Takes the given url and error object and creates a new
   * log entry accordingly. Normally the error object should
   * be either a {@link CertificateResponse} or a
   * {@link RawCertificateResponse}. But this function can also
   * handle other types of error objects.
   *
   * @param url The url which can be associated with this error.
   * @param errorResponse The error object which was thrown.
   */
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
