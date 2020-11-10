import { WebRequest } from "webextension-polyfill-ts";
import Subject from "../../../types/CommonTypes/certificate/Subject";
import CertificateFactory from "./CertificateFactory";

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
      },
    ],
  };
});

test("parses the defined subject fields CN, O, OU, L, ST, C", () => {
  securityInfo.certificates[0].subject = `
    CN=example.com,
    O=Example Company,
    OU=Example OrganizationalUnit,
    L=Example City,
    ST=Example State,
    C=Example Country
  `;

  const subject = new Subject(
    "example.com",
    "Example Company",
    "Example OrganizationalUnit",
    "Example City",
    "Example State",
    "Example Country"
  );

  const certificate = CertificateFactory.fromSecurityInfo(securityInfo);
  expect(certificate.subject).toEqual(subject);
});

test("doesn't parse fields not defined in X.509", () => {
  securityInfo.certificates[0].subject = `
    XCN=example.com,
    OX=Example Company,
    OXU=Example OrganizationalUnit,
    XL=Example City,
    SXT=Example State,
    CX=Example Country
  `;

  const subject = new Subject("", "", "", "", "", "");

  const certificate = CertificateFactory.fromSecurityInfo(securityInfo);
  expect(certificate.subject).toEqual(subject);
});
