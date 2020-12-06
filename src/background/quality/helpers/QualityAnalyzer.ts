import { Certificate } from "../../../types/certificate/Certificate";
import { Quality } from "../../../types/Quality";

export abstract class QualityAnalyzer {
  public static getQuality(certificate: Certificate): Quality {
    if (this.isDomainValidated(certificate)) {
      return Quality.DomainValidated;
    }

    if (this.isOrganizationValidated(certificate)) {
      return Quality.OrganizationValidated;
    }

    if (this.isExtendedValidated(certificate)) {
      return Quality.ExtendedValidated;
    }

    return Quality.Unknown;
  }

  private static isDomainValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.2.1");
  }

  private static isOrganizationValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.2.2");
  }

  private static isExtendedValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.1");
  }
}
