import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../../../types/CommonTypes/certificate/Certificate";
import DistinguishedName from "../../../types/CommonTypes/certificate/DistinguishedName";
import Issuer from "../../../types/CommonTypes/certificate/Issuer";
import Subject from "../../../types/CommonTypes/certificate/Subject";

export default abstract class CertificateFactory {
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
    const regex = /(^|,)\s*(?<attribute>CN?|OU?|L|ST)=(?<value>[^,]*)/g;
    let matches: RegExpExecArray | null = null;
    const params = new Map();

    matches = regex.exec(stringRepresentation);
    while (matches) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      params.set(matches!.groups!.attribute, matches!.groups!.value);
      matches = regex.exec(stringRepresentation);
    }

    return new DistinguishedName(
      (params.get("CN") || "").trim(),
      (params.get("O") || "").trim(),
      (params.get("OU") || "").trim(),
      (params.get("L") || "").trim(),
      (params.get("ST") || "").trim(),
      (params.get("C") || "").trim()
    );
  }
}
