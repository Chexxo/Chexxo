import { WebRequest } from "webextension-polyfill-ts";
import { UUIDFactory } from "../../../helpers/UUIDFactory";

import { InsecureConnectionError } from "../../../types/errors/InsecureConnectionError";
import { CertificateFactory } from "../factories/RawCertificateFactory";
import { CertificateProvider } from "./CertificateProvider";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

/**
 * Class to get the certificate of a given domain. This
 * is done by analyzing the security details given by
 * the browser.
 */
export class InBrowserProvider implements CertificateProvider {
  constructor(
    private getSecurityInfo: (
      requestId: string,
      options?: WebRequest.GetSecurityInfoOptionsType | undefined
    ) => Promise<WebRequest.SecurityInfo>
  ) {}

  /**
   * Gets the certificate of the domain specified within the
   * request details. This is done by reading the
   * securityInfo provided by the browser.
   *
   * @param requestDetails The details of the browser request which
   * lead to this invocation.
   */
  public async getCertificate(requestDetails: {
    url: string;
    requestId: string;
  }): Promise<RawCertificateResponse> {
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
