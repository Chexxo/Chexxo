import { WebRequest } from "webextension-polyfill-ts";
import RawCertificate from "../../../types/CommonTypes/certificate/RawCertificate";

export default interface CertificateProvider {
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificate>;
}
