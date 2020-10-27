import { WebRequest } from "webextension-polyfill-ts";

import Certificate from "../types/CommonTypes/certificate/Certificate";
import CertificateProvider from "./CertificateProvider";

export default class InBrowserProvider implements CertificateProvider {
  constructor(
    private getSecurityInfo: (
      requestId: string,
      options?: WebRequest.GetSecurityInfoOptionsType | undefined
    ) => Promise<WebRequest.SecurityInfo>
  ) {}

  async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate> {
    const { requestId } = requestDetails;
    const securityInfo = await this.getSecurityInfo(requestId, {
      certificateChain: false,
      rawDER: false,
    });

    return Certificate.fromSecurityInfo(securityInfo);
  }
}
