import { Certificate } from "../../types/certificate/Certificate";
import { Quality } from "../../types/Quality";
import { QualityAnalyzer } from "./helpers/QualityAnalyzer";
import { QualityProvider } from "./providers/QualityProvider";

export class QualityService {
  constructor(private qualityProvider: QualityProvider) {}

  getQuality(certificate: Certificate): Quality {
    return QualityAnalyzer.getQuality(certificate);
  }

  async setQuality(url: string, quality: Quality): Promise<void> {
    await this.qualityProvider.setQuality(url, quality);
  }

  async hasQualityDecreased(url: string, quality: Quality): Promise<boolean> {
    return await this.qualityProvider.hasQualityDecreased(url, quality);
  }

  async resetQuality(url: string): Promise<void> {
    return await this.qualityProvider.resetQuality(url);
  }
}
