import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../types/CommonTypes/certificate/Certificate";

export default interface CertificateProvider {
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate>;
}
