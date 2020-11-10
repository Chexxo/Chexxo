import { WebNavigation } from "webextension-polyfill-ts";

export default abstract class CertificateErrorAnalyzer {
  static analyzeError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): Error | undefined {
    console.log(requestDetails);
    return undefined;
  }
}
