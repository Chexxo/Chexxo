import Certificate from "../../../types/CommonTypes/certificate/Certificate";
import { Quality } from "../../../types/Quality";

export default abstract class QualityAnalyzer {
  static getQuality(certificate: Certificate): Quality {
    if (!this.isDomainValidated(certificate)) {
      return Quality.Unknown;
    }

    if (!this.isOrganizationValidated(certificate)) {
      return Quality.DomainValidated;
    }

    if (!this.isExtendedValidated(certificate)) {
      return Quality.OrganizationValidated;
    }

    return Quality.ExtendedValidated;
  }

  private static isDomainValidated(certificate: Certificate): boolean {
    return certificate.subject.commonName ? true : false;
  }

  private static isOrganizationValidated(certificate: Certificate): boolean {
    const {
      subject: { commonName, organization, state, location },
    } = certificate;

    if (commonName && organization && state && location) {
      return true;
    } else {
      return false;
    }
  }

  private static isExtendedValidated(certificate: Certificate): boolean {
    return certificate.hasExtendedValidation;
  }
}
