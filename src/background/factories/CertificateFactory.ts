import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../../types/CommonTypes/certificate/Certificate";
import Issuer from "../../types/CommonTypes/certificate/Issuer";
import Subject from "../../types/CommonTypes/certificate/Subject";

export default class CertificateFactory {
  public static fromSecurityInfo(
    securityInfo: WebRequest.SecurityInfo
  ): Certificate {
    const certificateInfo = securityInfo.certificates[0];

    return new Certificate(
      certificateInfo.fingerprint.sha1,
      certificateInfo.fingerprint.sha256,
      Issuer.fromString(certificateInfo.issuer),
      0,
      Subject.fromString(certificateInfo.subject),
      [],
      certificateInfo.validity.start,
      certificateInfo.validity.end,
      securityInfo.isExtendedValidation || false
    );
  }
}