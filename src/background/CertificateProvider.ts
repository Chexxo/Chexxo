import Certificate from "../models/Certificate";

export default interface CertificateProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCertificate(requestDetails: any): Promise<Certificate>;
}
