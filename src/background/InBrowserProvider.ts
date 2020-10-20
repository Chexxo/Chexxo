import Certificate from "../models/Certificate";
import Issuer from "../models/Issuer";
import Subject from "../models/Subject";
import CertificateProvider from "./CertificateProvider";

export default class InBrowserProvider implements CertificateProvider {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  async getCertificate(requestDetails: any): Promise<Certificate> {
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
          certificateInfo.serialNumber,
          Subject.fromString(certificateInfo.subject),
          url,
          0,
          0,
          securityInfo.isExtendedValidation
        )
      );
    });
  }
}
