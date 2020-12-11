import { ErrorFactory } from "../factories/ErrorFactory";

/**
 * Class that provides functionality regarding certificate errors.
 */
export abstract class CertificateErrorAnalyzer {
  /**
   * Converts the browser provided requestDetails into an error.
   *
   * @param requestDetails The details to be analyzed.
   *
   * @return The error which was found. If the request was made on a
   * browser internal url or in the background `null` is returned.
   */
  public static analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    const regex = /^(chrome|about):.*/;
    if (requestDetails.frameId !== 0 || regex.test(requestDetails.url)) {
      return null;
    }
    return ErrorFactory.fromBrowserErrorCode(requestDetails.error);
  }
}
