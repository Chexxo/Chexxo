import { WebNavigation } from "webextension-polyfill-ts";
import ErrorFactory from "../factories/ErrorFactory";

export default abstract class CertificateErrorAnalyzer {
  static analyzeError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): Error | undefined {
    /*
      has to asserted twice, because 'webextension-polyfill-ts' has declared 
      OnErrorOccuredDetailsType incorrectly
    */
    const errorOccuredDetails = (requestDetails as unknown) as {
      frameId: number;
      error: string;
    };

    if (requestDetails.frameId !== 0) {
      return;
    }
    return ErrorFactory.fromBrowserErrorCode(errorOccuredDetails.error);
  }
}
