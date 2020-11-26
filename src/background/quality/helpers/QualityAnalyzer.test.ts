import { Certificate } from "../../../types/certificate/Certificate";
import { Issuer } from "../../../types/certificate/Issuer";
import { Subject } from "../../../types/certificate/Subject";
import { Quality } from "../../../types/Quality";
import { QualityAnalyzer } from "./QualityAnalyzer";

test("detects a Domain Validated Certificate", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject("", "", "", "", "", "");
  const certificate = new Certificate("", "", issuer, "", subject, [], 0, 0, [
    "2.23.140.1.2.1",
  ]);

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.DomainValidated
  );
});

test("detects an Organization Validated Certificate", () => {
  const issuer = new Issuer("", "", "", "", "", "");
  const subject = new Subject("", "", "", "", "", "");
  const certificate = new Certificate("", "", issuer, "", subject, [], 0, 0, [
    "2.23.140.1.2.2",
  ]);

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
  const certificate = new Certificate("", "", issuer, "", subject, [], 0, 0, [
    "2.23.140.1.1",
  ]);

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
    "",
    subject,
    [],
    0,
    0,
    []
  );

  expect(QualityAnalyzer.getQuality(certificate)).toStrictEqual(
    Quality.Unknown
  );
});
