import { Certificate } from "../../types/certificate/Certificate";
import { Configuration } from "../../types/Configuration";
import { Quality } from "../../types/Quality";
import { QualityAnalyzer } from "./helpers/QualityAnalyzer";
import { QualityProvider } from "./providers/QualityProvider";

export class QualityService {
  constructor(private qualityProvider: QualityProvider) {}

  public updateConfiguration(configuration: Configuration): void {
    this.qualityProvider.updateIsCacheActive(
      configuration.cacheDomainQualities
    );
  }

  public getQuality(certificate: Certificate): Quality {
    return QualityAnalyzer.getQuality(certificate);
  }

  public async hasQualityDecreased(
    url: string,
    quality: Quality
  ): Promise<boolean> {
    return this.qualityProvider.hasQualityDecreased(url, quality);
  }

  public async defineQuality(url: string, quality: Quality): Promise<void> {
    return this.qualityProvider.defineQuality(url, quality);
  }

  public async resetQuality(url: string): Promise<void> {
    return this.qualityProvider.resetQuality(url);
  }

  public async removeQualities(): Promise<void> {
    return this.qualityProvider.removeQualities();
  }
}
