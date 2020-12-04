import { APIResponseBody } from "../../../shared/types/api/APIResponseBody";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { CodedError } from "../../../shared/types/errors/CodedError";
import { ErrorFactory } from "../factories/ErrorFactory";
import { CertificateProvider } from "./CertificateProvider";

const SERVER_URL =
  "https://snonitze65.execute-api.eu-central-1.amazonaws.com/getCertificate/";

export class ServerProvider implements CertificateProvider {
  public getCertificate(requestDetails: {
    url: string;
  }): Promise<RawCertificate> {
    const url = this.cleanUrl(requestDetails.url);
    return this.fetchCertificateFromServer(url);
  }

  private async fetchCertificateFromServer(
    url: string
  ): Promise<RawCertificate> {
    return new Promise((resolve, reject) => {
      fetch(SERVER_URL + url)
        .then((response) => response.json())
        .then((apiResponse: APIResponseBody) => {
          const result = this.analyzeAPIResponse(apiResponse);

          if (result instanceof CodedError) {
            reject(result);
          } else {
            resolve(result);
          }
        })
        .catch((error) => reject(error));
    });
  }

  private cleanUrl(url: string): string {
    const regex = /https:\/\/(?<url>[^\/]+)/g;
    let matches: RegExpExecArray | null = null;

    matches = regex.exec(url);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return matches!.groups!.url;
  }

  private analyzeAPIResponse(
    response: APIResponseBody
  ): RawCertificate | CodedError {
    if (response.error !== null) {
      return ErrorFactory.fromErrorDto(response.error);
    }

    return new RawCertificate(response.certificate);
  }
}
