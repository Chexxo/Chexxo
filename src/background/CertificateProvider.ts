import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../models/Certificate";

export default interface CertificateProvider {
  getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate>;
}
