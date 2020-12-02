import { WebRequest } from "webextension-polyfill-ts";

import { APIResponseBody } from "../../../shared/types/api/APIResponseBody";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { ServerUnavailableError } from "../../../types/errors/ServerUnavailableError";
import { ErrorFactory } from "../factories/ErrorFactory";
import { CertificateProvider } from "./CertificateProvider";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

export class ServerProvider implements CertificateProvider {
  static readonly defaultServerUrl =
    "https://cmsrvsfj03.execute-api.eu-central-1.amazonaws.com/";
  static readonly endpoint = "certificate/";
  private serverUrl: string;

  constructor() {
    this.serverUrl = ServerProvider.defaultServerUrl;
  }

  public updateServerUrl(serverUrl: string): void {
    if (serverUrl) {
      this.serverUrl = serverUrl;
    } else {
      this.serverUrl = ServerProvider.defaultServerUrl;
    }
  }

  public getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificateResponse> {
    const url = this.cleanUrl(requestDetails.url);
    return this.fetchCertificateFromServer(url);
  }

  private async fetchCertificateFromServer(
    url: string
  ): Promise<RawCertificateResponse> {
    return new Promise((resolve, reject) => {
      let urlToFetch: string = this.serverUrl;
      if (!this.serverUrl.endsWith("/")) {
        urlToFetch += "/";
      }
      urlToFetch += ServerProvider.endpoint + url;

      fetch(urlToFetch)
        .then((response) => response.json())
        .then((apiResponse: APIResponseBody) => {
          const result = this.analyzeAPIResponse(apiResponse);

          if (result.error !== undefined) {
            reject(result);
          } else {
            resolve(result);
          }
        })
        .catch((error) => {
          const typedError = error as Error;
          if (typedError.message === "Failed to fetch") {
            reject(new ServerUnavailableError());
          } else {
            reject(error);
          }
        });
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
  ): RawCertificateResponse {
    if (response.error !== null) {
      return new RawCertificateResponse(
        response.requestUuid,
        undefined,
        ErrorFactory.fromErrorDto(response.error)
      );
    }

    return new RawCertificateResponse(
      response.requestUuid,
      new RawCertificate(response.certificate)
    );
  }
}
