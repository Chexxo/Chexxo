import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../../types/CommonTypes/certificate/Certificate";
import DistinguishedName from "../../types/CommonTypes/certificate/DistinguishedName";
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
      this.IssuerFromString(certificateInfo.issuer),
      0,
      this.SubjectFromString(certificateInfo.subject),
      [],
      certificateInfo.validity.start,
      certificateInfo.validity.end,
      securityInfo.isExtendedValidation || false
    );
  }

  private static IssuerFromString(stringRepresentation: string): Issuer {
    return this.DistinguishedNameFromString(stringRepresentation) as Issuer;
  }

  private static SubjectFromString(stringRepresentation: string): Subject {
    return this.DistinguishedNameFromString(stringRepresentation) as Subject;
  }

  private static DistinguishedNameFromString(
    stringRepresentation: string
  ): DistinguishedName {
    const regex = /(CN?|OU?|L|ST)=([^,]*)/g;
    let matches: RegExpExecArray | null = null;
    const params = new Map();

    while ((matches = regex.exec(stringRepresentation))) {
      params.set(matches[1], matches[2]);
    }

    return new DistinguishedName(
      params.get("CN") || "",
      params.get("O") || "",
      params.get("OU") || "",
      params.get("L") || "",
      params.get("ST") || "",
      params.get("C") || ""
    );
  }
}
