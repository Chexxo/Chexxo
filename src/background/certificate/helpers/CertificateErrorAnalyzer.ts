import { ErrorFactory } from "../factories/ErrorFactory";

export abstract class CertificateErrorAnalyzer {
  static analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | null {
    if (requestDetails.frameId !== 0 || requestDetails.url === "about:blank") {
      return null;
    }
    return ErrorFactory.fromBrowserErrorCode(requestDetails.error);
  }
}
