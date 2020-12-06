import { APIResponseBody } from "../../../shared/types/api/APIResponseBody";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { ServerUnavailableError } from "../../../types/errors/ServerUnavailableError";
import { ErrorFactory } from "../factories/ErrorFactory";
import { CertificateProvider } from "./CertificateProvider";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";
import { ServerError } from "../../../shared/types/errors/ServerError";
import { UUIDFactory } from "../../../helpers/UUIDFactory";
import { InvalidUrlError } from "../../../shared/types/errors/InvalidUrlError";

/**
 * Class to get the certificate of a given domain. This
 * is done by requesting the certificate from the provided
 * Chexxo-Server url.
 */
export class ServerProvider implements CertificateProvider {
  /**
   * The default url which will be taken. This server is
   * maintained by Chexxo.
   */
  private static defaultServerUrl =
    "https://cmsrvsfj03.execute-api.eu-central-1.amazonaws.com/";
  /**
   * The endpoint which will be used in order to get the
   * certificate.
   */
  private static endpoint = "certificate/";
  /**
   * The server url which is defined in the extension
   * settings.
   */
  private serverUrl: string;

  constructor() {
    this.serverUrl = ServerProvider.defaultServerUrl;
  }

  /**
   * Updates the server url to represent the current
   * extension configuration.
   *
   * @param serverUrl The server url to be used in
   * order to get the certificate. If not set the
   * default url will be used.
   */
  public updateServerUrl(serverUrl?: string): void {
    if (serverUrl) {
      this.serverUrl = serverUrl;
    } else {
      this.serverUrl = ServerProvider.defaultServerUrl;
    }
  }

  public getCertificate(requestDetails: {
    url: string;
  }): Promise<RawCertificateResponse> {
    const url = this.cleanUrl(requestDetails.url);
    if (url) {
      return this.fetchCertificateFromServer(url);
    } else {
      return new Promise((resolve) => {
        resolve(
          new RawCertificateResponse(
            UUIDFactory.uuidv4(),
            undefined,
            new InvalidUrlError()
          )
        );
      });
    }
  }

  /**
   * Fetches the certificate of the given url
   * from the server.
   *
   * @param url The url of the domain from which
   * the certificate should be fetched by the
   * server.
   */
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
          if (!(apiResponse instanceof APIResponseBody)) {
            reject(
              new ServerError(new Error("Server returned invalid response."))
            );
          }

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

  /**
   * Cleans the url from query-strings and the
   * protocol prefix as well as subdirectories.
   *
   * @param url The url to be cleaned.
   */
  private cleanUrl(url: string): string {
    const regex = /https:\/\/(?<url>[^\/]+)/g;
    let matches: RegExpExecArray | null = null;

    matches = regex.exec(url);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return matches?.groups?.url || "";
  }

  /**
   * Analyzes the given {@link APIResponseBody}
   * and returns an appropriate {@link RawCertificateResponse}.
   *
   * @param response The {@link APIResponseBody}
   * to be analyzed.
   */
  private analyzeAPIResponse(
    response: APIResponseBody
  ): RawCertificateResponse {
    if (response.error !== null) {
      return new RawCertificateResponse(
        response.requestUuid,
        undefined,
        ErrorFactory.fromErrorDto(response.error)
      );
    } else if (response.certificate !== null) {
      return new RawCertificateResponse(
        response.requestUuid,
        new RawCertificate(response.certificate)
      );
    }

    return new RawCertificateResponse(
      response.requestUuid,
      undefined,
      new ServerError(
        new Error("APIResponse contained neither error nor certificate.")
      )
    );
  }
}
