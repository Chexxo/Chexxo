import { Certificate } from "../../../types/certificate/Certificate";
import { Quality } from "../../../types/Quality";

/**
 * Class providing functionality regarding the detection
 * of the quality of a certificate.
 */
export abstract class QualityAnalyzer {
  /**
   * Detects the quality of the given certificate.
   *
   * @param certificate The certificate of which the
   * quality shall be detected.
   *
   * @returns The quality of the certificate given.
   */
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

  /**
   * Detects if the given certificate is domain validated. This is
   * done by checking if the certificate contains the correct OID.
   *
   * @param certificate The certificate to be checked.
   */
  private static isDomainValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.2.1");
  }

  /**
   * Detects if the given certificate is organization validated. This is
   * done by checking if the certificate contains the correct OID.
   *
   * @param certificate The certificate to be checked.
   */
  private static isOrganizationValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.2.2");
  }

  /**
   * Detects if the given certificate is extended validated. This is
   * done by checking if the certificate contains the correct OID.
   *
   * @param certificate The certificate to be checked.
   */
  private static isExtendedValidated(certificate: Certificate): boolean {
    return certificate.certificatePolicies.includes("2.23.140.1.1");
  }
}
