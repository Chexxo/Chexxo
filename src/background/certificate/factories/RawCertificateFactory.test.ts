import { WebRequest } from "webextension-polyfill-ts";
import { CertificateFactory } from "./RawCertificateFactory";

let securityInfo: WebRequest.SecurityInfo;

beforeEach(() => {
  securityInfo = {
    state: "secure",
    certificates: [
      {
        subject: "",
        issuer: "",
        validity: { start: 0, end: 0 },
        fingerprint: { sha1: "", sha256: "" },
        serialNumber: "",
        isBuiltInRoot: false,
        subjectPublicKeyInfoDigest: { sha256: "" },
        rawDER: [1, 0, 1, 0],
      },
    ],
  };
});

test("converts a DER certificate to PEM format", () => {
  securityInfo.certificates[0].subject = `
    CN=example.com,
    O=Example Company,
    OU=Example OrganizationalUnit,
    L=Example City,
    ST=Example State,
    C=Example Country
  `;
  const regex = /^-{5}BEGIN CERTIFICATE-{5}.+-{5}END CERTIFICATE-{5}$/;

  const certificate = CertificateFactory.fromSecurityInfo(securityInfo);
  expect(certificate.pem).toMatch(regex);
});
