import { Certificate } from "../../types/certificate/Certificate";
import { Configuration } from "../../types/Configuration";
import { Quality } from "../../types/Quality";
import { QualityAnalyzer } from "./helpers/QualityAnalyzer";
import { QualityProvider } from "./providers/QualityProvider";

/**
 * Class which represents a service. This service is responsible
 * for all operations regarding certificate quality.
 */
export class QualityService {
  /**
   * @param qualityProvider The quality provider which
   * will be used to retrieve certificate qualities.
   */
  constructor(private qualityProvider: QualityProvider) {}

  /**
   * Sets the provided configuration in all components known
   * to this service which need it.
   *
   * @param configuration The new configuration to be used.
   */
  public updateConfiguration(configuration: Configuration): void {
    this.qualityProvider.updateIsCacheActive(
      configuration.cacheDomainQualities
    );
  }

  /**
   * See {@link QualityAnalyzer.getQuality}.
   */
  public getQuality(certificate: Certificate): Quality {
    return QualityAnalyzer.getQuality(certificate);
  }

  /**
   * See {@link QualityProvider.hasQualityDecreased}.
   */
  public async hasQualityDecreased(
    url: string,
    quality: Quality
  ): Promise<boolean> {
    return this.qualityProvider.hasQualityDecreased(url, quality);
  }

  /**
   * See {@link QualityProvider.defineQuality}.
   */
  public async defineQuality(url: string, quality: Quality): Promise<void> {
    return this.qualityProvider.defineQuality(url, quality);
  }

  /**
   * See {@link QualityProvider.resetQuality}.
   */
  public async resetQuality(url: string): Promise<void> {
    return this.qualityProvider.resetQuality(url);
  }

  /**
   * See {@link QualityProvider.removeQualities}.
   */
  public async removeQualities(): Promise<void> {
    return this.qualityProvider.removeQualities();
  }
}
