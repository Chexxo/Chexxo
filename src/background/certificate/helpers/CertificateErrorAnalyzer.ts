import ErrorFactory from "../factories/ErrorFactory";

export default abstract class CertificateErrorAnalyzer {
  static analyzeError(requestDetails: {
    frameId: number;
    error: string;
  }): Error | null {
    if (requestDetails.frameId !== 0) {
      return null;
    }
    return ErrorFactory.fromBrowserErrorCode(requestDetails.error);
  }
}
