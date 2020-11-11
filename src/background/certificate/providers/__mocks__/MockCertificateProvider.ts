import { WebRequest } from "webextension-polyfill-ts";

import Certificate from "../../../../types/certificate/Certificate";
import Issuer from "../../../../types/certificate/Issuer";
import Subject from "../../../../types/certificate/Subject";
import CertificateProvider from "../CertificateProvider";

export default class MockCertificateProvider implements CertificateProvider {
  async getCertificate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<Certificate> {
    const issuer = new Issuer("", "", "", "", "", "");
    const subject = new Subject("", "", "", "", "", "");
    return new Certificate("", "", issuer, 0, subject, [], 0, 0, false);
  }
}
