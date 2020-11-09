import Certificate from "../../types/CommonTypes/certificate/Certificate";
import { Quality } from "../../types/Quality";

export default class QualityAnalyzer {
  getQuality(certificate: Certificate): Quality {
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

  private isDomainValidated(certificate: Certificate): boolean {
    return certificate.subject.commonName ? true : false;
  }

  private isOrganizationValidated(certificate: Certificate): boolean {
    const {
      subject: { commonName, organization, state, location },
    } = certificate;

    if (commonName && organization && state && location) {
      return true;
    } else {
      return false;
    }
  }

  private isExtendedValidated(certificate: Certificate): boolean {
    return certificate.hasExtendedValidation;
  }
}
