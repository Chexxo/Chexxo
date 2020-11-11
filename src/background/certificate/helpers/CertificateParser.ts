import Certificate from "../../../types/certificate/Certificate";

export default abstract class CertificateParser {
  static getCertificate(rawData: Certificate): Certificate {
    console.log(rawData);
    return rawData;
  }
}
