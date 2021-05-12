import { X509, KJUR } from "jsrsasign";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { Certificate } from "../../../types/certificate/Certificate";
import { DistinguishedName } from "../../../types/certificate/DistinguishedName";
import { Issuer } from "../../../types/certificate/Issuer";
import { Subject } from "../../../types/certificate/Subject";

/**
 * Class responsible for generating a certificate from raw data.
 */
export abstract class CertificateParser {
  /**
   * Converts the provided {@link RawCertificate} into a certificate
   * object which may then be used by the extension.
   *
   * @param rawCert The raw certificate to be converted.
   */
  // eslint-disable-next-line max-lines-per-function
  public static getCertificate(rawCert: RawCertificate): Certificate {
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
        (element: { policyoid: string }) => {
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
    if (fullCert.getExtSubjectAltName()) {
      fullCert
        .getExtSubjectAltName()
        .array.forEach((element: { dns: string }) => {
          subjectAltNames.push(element.dns);
        });
    }

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

  /**
   * Converts a properly formated string into an issuer object. The
   * string is further specified in {@link CertificateParser.DistinguishedNameFromString}.
   *
   * @param stringRepresentation The string to be converted.
   */
  private static IssuerFromString(stringRepresentation: string): Issuer {
    return this.DistinguishedNameFromString(stringRepresentation) as Issuer;
  }

  /**
   * Converts a properly formated string into an subject object. The
   * string is further specified in {@link CertificateParser.DistinguishedNameFromString}.
   *
   * @param stringRepresentation The string to be converted.
   */
  private static SubjectFromString(stringRepresentation: string): Subject {
    return this.DistinguishedNameFromString(stringRepresentation) as Subject;
  }

  /**
   * Converts a properly formated string into a distinguished name. To
   * be properly formated the string has to contain key-value pairs
   * separated by a `/`.
   *
   * Example:
   * ```typescript
   * CertificateParser.DistinguishedNameFromString(
   *  "CN=My User/O=My Org/OU=Unit/C=AU/L=My Town"
   * );
   * ```
   *
   * @param stringRepresentation The string to be converted.
   */
  private static DistinguishedNameFromString(
    stringRepresentation: string
  ): DistinguishedName {
    const regex = /(^|\/)\s*(?<attribute>CN?|OU?|L|ST)=(?<value>[^\/]*)/g;
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

  /**
   * Converts the UTCTime of X.509 into a linux timestamp.
   * This approach is only valid until 2050 afterwards GeneralizedTime
   * will be used by X.509 see [RFC5280](https://tools.ietf.org/html/rfc5280) chapter 4.1.2.5.
   *
   * Example:
   * ```typescript
   * CertificateParser.getTimestampFromUTCTime(
   *  "101231235930Z"
   * ); //Returns 1293839970 which is 31.12.2010 11:59:30
   */
  private static getTimestampFromUTCTime(utcTime: string): number {
    const regex =
      /(?<year>\d{2})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<minute>\d{2})(?<second>[0-9]{2})Z/gi;
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

  /**
   * Returns the prettified SHA1-fingerprint of the given certificate.
   *
   * @param certHex The X.509 certificate in hex format.
   */
  private static getFingerprint(certHex: string) {
    const sha1MD = new KJUR.crypto.MessageDigest({
      alg: "sha1",
      prov: "cryptojs",
    });
    sha1MD.updateHex(certHex);
    const hash: string = sha1MD.digest();
    return CertificateParser.prettifyHex(hash);
  }

  /**
   * Returns the prettified SHA256-fingerprint of the given certificate.
   *
   * @param certHex The X.509 certificate in hex format.
   */
  private static getFingerprint256(certHex: string) {
    const sha256MD = new KJUR.crypto.MessageDigest({
      alg: "sha256",
      prov: "cryptojs",
    });
    sha256MD.updateHex(certHex);
    const hash: string = sha256MD.digest();
    return CertificateParser.prettifyHex(hash);
  }

  /**
   * Prettifies the given hex string by adding sepeators and uppercasing
   * the characters.
   *
   * Example:
   * ```typescript
   * CertificateParser.prettifyHex(
   *  "1015efb6d8"
   * ); //Returns 10:15:EF:B6:D8
   *
   * @param hex The string to be formated.
   */
  private static prettifyHex(hex: string) {
    hex = hex.toUpperCase();
    const hashArray = hex.match(/.{1,2}/g);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    hex = hashArray!.filter(Boolean).join(":");
    return hex;
  }
}
