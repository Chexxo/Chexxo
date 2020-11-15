import ErrorFactory from "../factories/ErrorFactory";

export default abstract class CertificateErrorAnalyzer {
  static analyzeError(requestDetails: {
    frameId: number;
    error: string;
  }): Error | undefined {
    if (requestDetails.frameId !== 0) {
      return;
    }
    return ErrorFactory.fromBrowserErrorCode(requestDetails.error);
  }
}
