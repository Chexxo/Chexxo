import { WebRequest } from "webextension-polyfill-ts";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";

export interface CertificateProvider {
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificateResponse>;
}
