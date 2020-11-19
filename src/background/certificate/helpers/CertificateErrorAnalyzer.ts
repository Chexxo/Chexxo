import ErrorFactory from "../factories/ErrorFactory";

export default abstract class CertificateErrorAnalyzer {
  static analyzeError(requestDetails: {
    url: string;
    frameId: number;
    error: string;
  }): Error | undefined {
    console.log(requestDetails);
    if (requestDetails.frameId !== 0 || requestDetails.url === "about:blank") {
      return;
    }
    return ErrorFactory.fromBrowserErrorCode(requestDetails.error);
  }
}
