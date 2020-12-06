import { UUIDFactory } from "../../helpers/UUIDFactory";
import { CertificateResponse } from "../../types/certificate/CertificateResponse";
import { Configuration } from "../../types/Configuration";
import { UnknownCertificateError } from "../../types/errors/certificate/UnknownCertificateError";
import { CertificateErrorAnalyzer } from "./helpers/CertificateErrorAnalyzer";
import { CertificateParser } from "./helpers/CertificateParser";
import { CertificateProvider } from "./providers/CertificateProvider";
import { ServerProvider } from "./providers/ServerProvider";

export class CertificateService {
  constructor(private certificateProvider: CertificateProvider) {}

  public updateConfiguration(configuration: Configuration): void {
    if (this.certificateProvider instanceof ServerProvider) {
      (this.certificateProvider as ServerProvider).updateServerUrl(
        configuration.serverUrl
      );
    }
  }

  public async getCertificate(requestDetails: {
    url: string;
    requestId?: string;
  }): Promise<CertificateResponse> {
    const rawCertificateResponse = await this.certificateProvider.getCertificate(
      requestDetails
    );

    let certificate;
    if (rawCertificateResponse.rawCertificate !== undefined) {
      try {
        certificate = CertificateParser.getCertificate(
          rawCertificateResponse.rawCertificate
        );
      } catch (error) {
        throw new CertificateResponse(
          UUIDFactory.uuidv4(),
          undefined,
          new UnknownCertificateError(error.message)
        );
      }

      return new CertificateResponse(
        rawCertificateResponse.requestUuid,
        certificate
      );
    }

    throw new CertificateResponse(
      rawCertificateResponse.requestUuid,
      undefined,
      rawCertificateResponse.error
    );
  }

  public analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    return CertificateErrorAnalyzer.analyzeError(requestDetails);
  }
}
