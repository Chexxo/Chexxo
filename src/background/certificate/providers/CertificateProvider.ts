import { WebRequest } from "webextension-polyfill-ts";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";

export interface CertificateProvider {
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificate>;
}
