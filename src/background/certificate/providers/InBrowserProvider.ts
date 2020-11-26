import { WebRequest } from "webextension-polyfill-ts";

import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { InsecureConnectionError } from "../../../types/errors/InsecureConnectionError";
import { CertificateFactory } from "../factories/RawCertificateFactory";
import { CertificateProvider } from "./CertificateProvider";

export class InBrowserProvider implements CertificateProvider {
  constructor(
    private getSecurityInfo: (
      requestId: string,
      options?: WebRequest.GetSecurityInfoOptionsType | undefined
    ) => Promise<WebRequest.SecurityInfo>
  ) {}

  async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificate> {
    const { requestId } = requestDetails;
    const securityInfo = await this.getSecurityInfo(requestId, {
      certificateChain: false,
      rawDER: true,
    });

    if (securityInfo.state === "insecure") {
      throw new InsecureConnectionError();
    }

    return CertificateFactory.fromSecurityInfo(securityInfo);
  }
}
