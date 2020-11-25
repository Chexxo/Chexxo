import { Certificate } from "../../types/certificate/Certificate";
import { Quality } from "../../types/Quality";
import { QualityAnalyzer } from "./helpers/QualityAnalyzer";
import { QualityProvider } from "./providers/QualityProvider";

export class QualityService {
  constructor(private qualityProvider: QualityProvider) {}

  getQuality(certificate: Certificate): Quality {
    return QualityAnalyzer.getQuality(certificate);
  }
}
