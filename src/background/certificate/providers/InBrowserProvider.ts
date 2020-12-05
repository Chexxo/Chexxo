import { WebRequest } from "webextension-polyfill-ts";
import { UUIDFactory } from "../../../helpers/UUIDFactory";

import { InsecureConnectionError } from "../../../types/errors/InsecureConnectionError";
import { CertificateFactory } from "../factories/RawCertificateFactory";
import { CertificateProvider } from "./CertificateProvider";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

export class InBrowserProvider implements CertificateProvider {
  constructor(
    private getSecurityInfo: (
      requestId: string,
      options?: WebRequest.GetSecurityInfoOptionsType | undefined
    ) => Promise<WebRequest.SecurityInfo>
  ) {}

  public async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificateResponse> {
    const requestUuid = UUIDFactory.uuidv4();
    const { requestId } = requestDetails;
    const securityInfo = await this.getSecurityInfo(requestId, {
      certificateChain: false,
      rawDER: true,
    });

    if (securityInfo.state === "insecure") {
      throw new RawCertificateResponse(
        requestUuid,
        undefined,
        new InsecureConnectionError()
      );
    }

    return new RawCertificateResponse(
      requestUuid,
      CertificateFactory.fromSecurityInfo(securityInfo)
    );
  }
}
