/*import Certificate from "../../../types/certificate/Certificate";
import Issuer from "../../../types/certificate/Issuer";
import Subject from "../../../types/certificate/Subject";
import { Quality } from "../../../types/Quality";
import QualityAnalyzer from "./QualityAnalyzer";

test("detects a Domain Validated Certificate", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject("example.com", "", "", "", "", "");
  const certificate = new Certificate(
    "",
    "",
    issuer,
    0,
    subject,
    [],
    0,
    0,
    false
  );

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.DomainValidated
  );
});

test("detects an Organization Validated Certificate", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject(
    "example.com",
    "Example Company",
    "",
    "Example City",
    "Example State",
    "Example Country"
  );
  const certificate = new Certificate(
    "",
    "",
    issuer,
    0,
    subject,
    [],
    0,
    0,
    false
  );

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.OrganizationValidated
  );
});

test("detects an Extended Validated Certificate", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject(
    "example.com",
    "Example Company",
    "",
    "Example City",
    "Example State",
    "Example Country"
  );
  const certificate = new Certificate(
    "",
    "",
    issuer,
    0,
    subject,
    [],
    0,
    0,
    true
  );

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.ExtendedValidated
  );
});

test("detects a non-conforming Certificate as Unknown", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject("", "", "", "", "", "");
  const certificate = new Certificate(
    "",
    "",
    issuer,
    0,
    subject,
    [],
    0,
    0,
    false
  );

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.Unknown
  );
});
*/
