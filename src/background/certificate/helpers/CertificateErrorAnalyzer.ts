import { ErrorFactory } from "../factories/ErrorFactory";

export abstract class CertificateErrorAnalyzer {
  static analyzeError(requestDetails: {
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
