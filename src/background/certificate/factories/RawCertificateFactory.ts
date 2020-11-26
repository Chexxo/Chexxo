import { WebRequest } from "webextension-polyfill-ts";
import { bytesToBase64 } from "byte-base64";
import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";

export abstract class CertificateFactory {
  public static fromSecurityInfo(
    securityInfo: WebRequest.SecurityInfo
  ): RawCertificate {
    const certificateInfo = securityInfo.certificates[0];
    const prefix = "-----BEGIN CERTIFICATE-----";
    const postfix = "-----END CERTIFICATE-----";
    let pemCertificate = "";
    if (certificateInfo.rawDER !== undefined) {
      pemCertificate = prefix + bytesToBase64(certificateInfo.rawDER) + postfix;
    }
    return new RawCertificate(pemCertificate);
  }
}
