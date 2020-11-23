import { X509, KJUR } from "jsrsasign";
import Certificate from "../../../types/certificate/Certificate";
import DistinguishedName from "../../../types/certificate/DistinguishedName";
import Issuer from "../../../types/certificate/Issuer";
import Subject from "../../../types/certificate/Subject";
import RawCertificate from "../../../types/CommonTypes/certificate/RawCertificate";

class AltNameEntry {
  readonly dns: string = "";
}

class CertificatePolicyEntry {
  readonly policyoid: string = "";
}

export default abstract class CertificateParser {
  static getCertificate(rawCert: RawCertificate): Certificate {
    const fullCert = new X509();
    fullCert.readCertPEM(rawCert.pem);

    const validFrom = CertificateParser.getTimestampFromUTCTime(
      fullCert.getNotBefore()
    );
    const validTo = CertificateParser.getTimestampFromUTCTime(
      fullCert.getNotAfter()
    );

    const certificatePoliciesTemp = fullCert.getExtCertificatePolicies();
    const certificatePolicies: string[] = [];
    if (certificatePoliciesTemp !== undefined) {
      certificatePoliciesTemp.array.forEach(
        (element: CertificatePolicyEntry) => {
          certificatePolicies.push(element.policyoid);
        }
      );
    }

    const serialNumber = CertificateParser.prettifyHex(
      fullCert.getSerialNumberHex()
    );
    const fingerprint = CertificateParser.getFingerprint(fullCert.hex);
    const fingerprint256 = CertificateParser.getFingerprint256(fullCert.hex);

    const subjectAltNames: string[] = [];
    fullCert.getExtSubjectAltName().array.forEach((element: AltNameEntry) => {
      subjectAltNames.push(element.dns);
    });

    const issuer = CertificateParser.IssuerFromString(fullCert.getIssuer().str);
    const subject = CertificateParser.SubjectFromString(
      fullCert.getSubject().str
    );

    const cert = new Certificate(
      fingerprint,
      fingerprint256,
      issuer,
      serialNumber,
      subject,
      subjectAltNames,
      validFrom,
      validTo,
      certificatePolicies
    );
    return cert;
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
    const regex = /(^|\/)\s*(?<attribute>CN?|OU?|L|ST)=(?<value>[^\/]*)/g;
    let matches: RegExpExecArray | null = null;
    const params = new Map();

    matches = regex.exec(stringRepresentation);
    console.error(matches);
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

  /**
   * Converts the UTCTime of X.509 into a linux timestamp.
   * This approach is only valid until 2050 afterwards GeneralizedTime
   * will be used by X.509 see [RFC5280](https://tools.ietf.org/html/rfc5280) chapter 4.1.2.5.
   */
  private static getTimestampFromUTCTime(utcTime: string): number {
    const regex = /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<minute>\d{2})(?<second>[0-9]{2})Z/gi;
    let matches: RegExpExecArray | null = null;
    matches = regex.exec(utcTime);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const yeartmp = parseInt(matches!.groups!.year, 10);
    let year = 0;
    if (yeartmp >= 50) {
      year = 1900 + yeartmp;
    } else {
      year = 2000 + yeartmp;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const month = parseInt(matches!.groups!.month, 10);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const day = parseInt(matches!.groups!.day, 10);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hour = parseInt(matches!.groups!.hour, 10);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const minute = parseInt(matches!.groups!.minute, 10);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const second = parseInt(matches!.groups!.second, 10);

    return Math.floor(
      new Date(Date.UTC(year, month - 1, day, hour, minute, second)).getTime() /
        1000
    );
  }

  private static getFingerprint(certHex: string) {
    const sha1MD = new KJUR.crypto.MessageDigest({
      alg: "sha1",
      prov: "cryptojs",
    });
    sha1MD.updateHex(certHex);
    const hash: string = sha1MD.digest();
    return CertificateParser.prettifyHex(hash);
  }

  private static getFingerprint256(certHex: string) {
    const sha256MD = new KJUR.crypto.MessageDigest({
      alg: "sha256",
      prov: "cryptojs",
    });
    sha256MD.updateHex(certHex);
    const hash: string = sha256MD.digest();
    return CertificateParser.prettifyHex(hash);
  }

  private static prettifyHex(hash: string) {
    hash = hash.toUpperCase();
    const hashArray = hash.match(/.{1,2}/g);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    hash = hashArray!.filter(Boolean).join(":");
    return hash;
  }
}
