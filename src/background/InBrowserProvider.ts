import { WebRequest } from "webextension-polyfill-ts";

import Certificate from "../types/CommonTypes/certificate/Certificate";
import InsecureConnectionError from "../types/errors/InsecureConnectionError";
import CertificateFactory from "./CertificateFactory";
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

    if (securityInfo.state === "insecure") {
      throw new InsecureConnectionError();
    }

    return CertificateFactory.fromSecurityInfo(securityInfo);
  }
}
