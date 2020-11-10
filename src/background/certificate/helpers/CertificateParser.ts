import Certificate from "../../../types/CommonTypes/certificate/Certificate";

export default abstract class CertificateParser {
  static getCertificate(rawData: Certificate): Certificate {
    console.log(rawData);
    return rawData;
  }
}
