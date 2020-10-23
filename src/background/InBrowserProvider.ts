import { browser, WebRequest } from "webextension-polyfill-ts";

import Certificate from "../types/CommonTypes/certificate/Certificate";
import Issuer from "../types/CommonTypes/certificate/Issuer";
import Subject from "../types/CommonTypes/certificate/Subject";
import CertificateProvider from "./CertificateProvider";

export default class InBrowserProvider implements CertificateProvider {
  async getCertificate(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate> {
    return new Promise(async function (resolve) {
      const { requestId, url } = requestDetails;

      const securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: false,
        rawDER: false,
      });
      const certificateInfo = securityInfo.certificates[0];

      resolve(
        new Certificate(
          certificateInfo.fingerprint.sha1,
          certificateInfo.fingerprint.sha256,
          Issuer.fromString(certificateInfo.issuer),
          0, //certificateInfo.serialNumber,
          Subject.fromString(certificateInfo.subject),
          [url],
          certificateInfo.validity.start,
          certificateInfo.validity.end,
          securityInfo.isExtendedValidation || false
        )
      );
    });
  }
}
