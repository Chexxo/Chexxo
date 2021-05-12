import { UUIDFactory } from "../../helpers/UUIDFactory";
import { CertificateResponse } from "../../types/certificate/CertificateResponse";
import { Configuration } from "../../types/Configuration";
import { UnknownCertificateError } from "../../types/errors/certificate/UnknownCertificateError";
import { CertificateErrorAnalyzer } from "./helpers/CertificateErrorAnalyzer";
import { CertificateParser } from "./helpers/CertificateParser";
import { CertificateProvider } from "./providers/CertificateProvider";
import { ServerProvider } from "./providers/ServerProvider";

/**
 * Class which represents a service. This service is responsible
 * for all operations regarding certificates.
 */
export class CertificateService {
  constructor(private certificateProvider: CertificateProvider) {}

  /**
   * Sets the provided configuration in all components known
   * to this service which need it.
   *
   * @param configuration The new configuration to be used.
   */
  public updateConfiguration(configuration: Configuration): void {
    if (this.certificateProvider instanceof ServerProvider) {
      (this.certificateProvider as ServerProvider).updateServerUrl(
        configuration.serverUrl
      );
    }
  }

  /**
   * Gets the certificate for the url specified in the request details
   * from the attached {@link CertificateProvider}.
   * @param requestDetails The details of the browser request which
   * lead to this invocation.
   */
  public async getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<CertificateResponse> {
    const rawCertificateResponse =
      await this.certificateProvider.getCertificate(requestDetails);

    if (rawCertificateResponse.rawCertificate !== undefined) {
      try {
        const certificate = CertificateParser.getCertificate(
          rawCertificateResponse.rawCertificate
        );

        return new CertificateResponse(
          rawCertificateResponse.requestUuid,
          certificate
        );
      } catch (error) {
        throw new CertificateResponse(
          UUIDFactory.uuidv4(),
          undefined,
          new UnknownCertificateError(error.message)
        );
      }
    }

    throw new CertificateResponse(
      rawCertificateResponse.requestUuid,
      undefined,
      rawCertificateResponse.error
    );
  }

  /**
   * Analyzes the given request details by using the
   * {@link CertificateErrorAnalyzer}.
   *
   * @param requestDetails The details of the browser request which
   * lead to this invocation.
   *
   * @return The error which was found. If the request was made on a
   * browser internal url or in the background `null` is returned.
   */
  public analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
